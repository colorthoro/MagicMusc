from queue import Queue
from time import sleep
from flask import Flask, jsonify, request, session, Response
from aligo import Aligo
import re
import json
import string
import random, time, os

app = Flask(__name__)
ali = Aligo()

musicPattern = re.compile(r'(.+\.(mp3|avi))', re.I)
with open('secret.json', 'r', encoding='utf-8') as f:
    secret = json.load(f)



@app.route('/')
def index():
    return 'hi'

@app.route('/register', methods=['post'])
def register():
    user_id = request.json['user_id']
    sp = request.json['sp']
    if user_id in secret:
        return 'id已经存在'
    secret[user_id]={
        'id': user_id,
        'sp': sp,
        'token':{
            'code':'',
            'expired': 0,
        }
    }
    return 'ok'

@app.route('/login', methods=['post'])
def login():
    user_id = request.json['user_id']
    sp = request.json['sp']
    if user_id not in secret:
        return '请先注册'
    if secret[user_id]['sp'] != sp:
        return '密码错误'
    code = ''.join(random.sample(string.ascii_letters+string.digits, 32))
    secret[user_id]['token']={
        'code': code,
        'expired': time.time() + 60*60*24*3,
    }
    with open('secret.json', 'w', encoding='utf-8') as f:
        json.dump(secret, f)
    return jsonify(secret[user_id]['token'])

@app.route('/scanMusic')
def scanMuic():
    # with open('test.json','r', encoding='utf-8') as f:
    #     return jsonify(json.load(f))
    q = Queue()
    q.put('root')
    res = list()
    while(not q.empty()):
        parent = q.get()
        try:
            items = ali.get_file_list(parent)
            for item in items:
                if item.type == 'folder':
                    q.put(item.file_id)
                elif musicPattern.match(item.name):
                    print(item)
                    res.append({
                        'name': item.name,
                        'mime_extension': item.mime_extension,
                        'file_id': item.file_id,
                        'parent_file_id': item.parent_file_id,
                        'status': item.status, 
                        'content_hash': item.content_hash,
                        'download_url': item.download_url,
                        'size': item.size,
                        'trashed': item.trashed,
                    })
            sleep(1)
        except Exception as e:
            print(e)
    return jsonify(res)


@app.route('/dw', methods=['post'])
def cache():
    hash = request.json['hash']
    url = request.json['url']
    file_path = os.path.join(os.getcwd(), hash)
    ali.download_file(file_path=file_path, url=url)
    def send_chunk():  # 流式读取
        store_path = file_path
        with open(store_path, 'rb') as target_file:
            while True:
                chunk = target_file.read(20 * 1024 * 1024)  # 每次读取20M
                if not chunk:
                    break
                yield chunk
    return Response(send_chunk(), content_type='application/octet-stream')

app.run()