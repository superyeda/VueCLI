<script setup>
</script>
<template>
    <h1>APP...</h1>
    <ul>
        <li>
            <router-link to="/home">Home</router-link>
        </li>
        <li>
            <router-link to="/about">About</router-link>
        </li>
    </ul>
    <router-view></router-view>
</template>

<style>
h1{
    color: pink;
}
</style>
