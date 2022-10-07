<template>
    <div>
        <div class="container">
            <button class="control" @click="getAllSongsFromCloud">
                点我获取全部云音乐
            </button>
            <div class="all">
                <div class="song" v-for="song of songLists.all.values()" :key="song.file_id">
                    {{song.name}}
                    <button @click="delFromList({id:song.file_id, listName:'all'})">
                        删除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapActions} from 'pinia'
import {useSongListsStore} from '../stores/songLists'

export default {
    name:'SongList',
    data(){
        return {
            
        }
    },
    computed: {
        ...mapState(useSongListsStore, ['songLists']),
    },
    methods: {
        ...mapActions(useSongListsStore, ['delFromList', 'getAllSongsFromCloud']),
    },
}
</script>

<style>

</style>