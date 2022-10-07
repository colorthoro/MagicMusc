<template>
    <div>
        <div class="container">
            <div class="control" @click="getAllSongsFromCloud">
                点我获取全部云音乐
            </div>
            <div class="all">
                <div class="song" v-for="song in songLists.all.list" :key="song.file_id">
                    {{song.name}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'

export default {
    name:'SongList',
    data(){
        return {
            
        }
    },
    computed: {
        ...mapState(['songLists']),
    },
    methods: {
        ...mapActions(['getAllSongsFromCloud']),
    },
}
</script>

<style>

</style>