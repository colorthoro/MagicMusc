<template>
    <form>
        注册：
        id:<input type="text" name="user_id" id="id" v-model="user_id">
        pwd:<input type="password" name="sp" id="pwd" v-model="sp">
        <button @click.prevent="register">注册</button>
        <button @click.prevent="login">登录</button>
    </form>
</template>

<script>
import {mapWritableState} from 'pinia'
import useUserStore from '../store/user'
import axios from 'axios'

export default {
    data:()=>({
        sp: '',
    }),
    computed:{
        ...mapWritableState(useUserStore, ['user_id', 'logined']),
    },
    methods:{
        async register(){
            let res = await axios({
                url:'api/register',
                method:'post',
                data:{
                    user_id: this.user_id,
                    sp: this.sp
                }
            });
            console.log(res.data);
        },
        async login(){
            let res = await axios({
                url:'api/login',
                method:'post',
                data:{
                    user_id: this.user_id,
                    sp: this.sp
                }
            });
            if(res.data.code){
                this.$cookies.set('user_id', this.user_id);
                this.$cookies.set('token', res.data.code, new Date(res.data.expired));
                this.logined = true;
                console.log('success');
            }else{
                console.log(res.data);
            }
        }
    }

}
</script>

<style>

</style>