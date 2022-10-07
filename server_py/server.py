from queue import Queue
from time import sleep
from flask import Flask, jsonify
from aligo import Aligo
import re
import json

app = Flask(__name__,)
ali = Aligo()

musicPattern = re.compile(r'(.+\.(mp3|avi))', re.I)


@app.route('/')
def index():
    return 'hi'


@app.route('/scanMusic')
def scanMuic():
    with open('test.json','r', encoding='utf-8') as f:
        return jsonify(json.load(f))
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
                        'file_id': item.file_id,
                        'status': item.status, 
                        'size': item.size,
                        'parent_file_id': item.parent_file_id
                    })
            sleep(0.5)
        except Exception as e:
            print(e)
    return jsonify(res)

app.run()