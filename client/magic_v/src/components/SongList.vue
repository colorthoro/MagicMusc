<template>
    <div>
        <div class="container">
            <button class="control" @click="getAllSongsFromCloud">
                点我获取全部云音乐
            </button>
            <div class="all">
                <div class="song" v-for="song of allSongs.values()" :key="song.file_id">
                    {{song.name}}
                    <button @click="delFromList({id:song.file_id, listName:'allSongs'})">
                        删除
                    </button>
                </div>
            </div>
            <div class="bin">
                以下是回收站文件
                <div class="song" v-for="song of binSongs.values()" :key="song.file_id">
                    {{song.name}}
                    <button @click="delFromList({id:song.file_id, listName:'binSongs'})">
                        删除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapActions} from 'pinia'
import useSongListsStore from '../store/songLists'

export default {
    name:'SongList',
    data(){
        return {
            
        }
    },
    computed: {
        ...mapState(useSongListsStore, ['allSongs', 'lostSongs', 'binSongs']),
    },
    methods: {
        ...mapActions(useSongListsStore, ['delFromList', 'getAllSongsFromCloud']),
    },
}
</script>

<style>

</style>