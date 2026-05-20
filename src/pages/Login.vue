<template>
	<view class="login-page">
		<!-- 顶部应用名称 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<text class="app-name">贴心小护士</text>
			<text class="app-subtitle">智能用药助手</text>
		</view>

		<!-- 中间：插画 + 宣传文案 -->
		<view class="hero-section">
			<view class="cloud cloud-1"></view>
			<view class="cloud cloud-2"></view>

			<view class="hero-illustration">
				<view class="illus-scene">
					<view class="nurse">
						<view class="nurse-head"></view>
						<view class="nurse-cap"></view>
						<view class="nurse-body"></view>
					</view>
					<view class="medicine-box">
						<view class="box-cross-h"></view>
						<view class="box-cross-v"></view>
					</view>
					<view class="pill pill-blue"></view>
					<view class="pill pill-red"></view>
					<view class="calendar">
						<view class="cal-header"></view>
					</view>
				</view>
			</view>

			<view class="slogan-wrap">
				<text class="slogan-line1">欢迎使用</text>
				<text class="slogan-line2">智能用药，健康相伴</text>
				<text class="slogan-desc">科学提醒 · 安心服药 · 守护健康</text>
			</view>
		</view>

		<!-- 底部：协议 + 微信登录 -->
		<view class="footer-section">
			<view class="agreement-row" @tap="toggleAgree">
				<view class="checkbox" :class="{ 'checkbox--checked': agreed }">
					<text v-if="agreed" class="checkbox-tick">✓</text>
				</view>
				<view class="agreement-text-wrap">
					<text class="agreement-text">我已阅读并同意</text>
					<text class="agreement-link">《用户协议》</text>
					<text class="agreement-text">和</text>
					<text class="agreement-link">《隐私政策》</text>
				</view>
			</view>

			<button
				class="btn-wx-login"
				:loading="logging"
				:disabled="logging"
				@tap="handleWxLogin"
			>
				<text class="btn-wx-icon">微信</text>
				<text class="btn-wx-text">微信授权登录</text>
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { isLoggedIn, saveUserInfo } from '../utils/auth.js'
import { post } from '../utils/request.js'

const statusBarHeight = ref(20)
/** 是否已勾选用户协议 */
const agreed = ref(false)
/** 登录请求中，防止重复点击 */
const logging = ref(false)

onLoad(() => {
	const sys = uni.getSystemInfoSync()
	statusBarHeight.value = sys.statusBarHeight || 20

	// ① 已有本地登录信息，直接进入首页
	if (isLoggedIn()) {
		uni.reLaunch({ url: '/pages/Index' })
	}
})

/** 切换协议勾选状态 */
function toggleAgree() {
	agreed.value = !agreed.value
}

/**
 * ③ 微信授权登录
 * 必须先勾选协议；调用 uni.login 获取 code，然后调用后端接口
 */
function handleWxLogin() {
	// ② 未勾选协议，提示并阻断
	if (!agreed.value) {
		uni.showToast({
			title: '请先同意用户协议和隐私政策',
			icon: 'none',
			duration: 2000
		})
		return
	}

	if (logging.value) return
	logging.value = true

	// #ifdef MP-WEIXIN
	// 先调用 uni.login 获取微信临时 code
	uni.login({
		provider: 'weixin',
		success: (loginRes) => {
			if (loginRes.code) {
				// 调用后端登录接口
				callLoginApi(loginRes.code)
			} else {
				onLoginFail()
			}
		},
		fail: () => {
			onLoginFail()
		}
	})
	// #endif

	// #ifndef MP-WEIXIN
	logging.value = false
	uni.showToast({
		title: '请在微信小程序中授权登录',
		icon: 'none'
	})
	// #endif
}

/**
 * 调用后端登录接口
 * @param {string} code - 微信登录临时code
 */
async function callLoginApi(code) {
	try {
		// 调用登录接口：POST /api/medicineBox/user/login
		const result = await post('/user/login', { code }, { showLoading: true })

		// 接口返回 userId、nickName、avatar、token
		if (result) {
			// 保存登录信息到本地
			saveUserInfo(result)

			uni.showToast({
				title: '登录成功',
				icon: 'success',
				duration: 1500
			})

			setTimeout(() => {
				uni.reLaunch({ url: '/pages/Index' })
			}, 1500)
		}
	} catch (error) {
		console.error('登录失败:', error)
		// 错误已在request.js中统一处理
	} finally {
		logging.value = false
	}
}

/**
 * ⑤ 登录失败：提示失败，停留在登录页
 */
function onLoginFail() {
	logging.value = false
	uni.showToast({
		title: '授权失败，请重新授权后使用',
		icon: 'none',
		duration: 2500
	})
}
</script>

<style scoped>
.login-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: linear-gradient(180deg, #e8f5fc 0%, #f5fafd 45%, #ffffff 100%);
}

/* 顶部应用名称 */
.header {
	padding: 24rpx 40rpx 16rpx;
	text-align: center;
	flex-shrink: 0;
}

.app-name {
	font-size: 44rpx;
	font-weight: 700;
	color: #1a4a6e;
	display: block;
	letter-spacing: 4rpx;
}

.app-subtitle {
	font-size: 26rpx;
	color: #6ec1e8;
	margin-top: 8rpx;
	display: block;
}

/* 中间插画区 */
.hero-section {
	flex: 1;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24rpx 40rpx;
	overflow: hidden;
}

.cloud {
	position: absolute;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 40rpx;
}

.cloud-1 {
	width: 100rpx;
	height: 40rpx;
	top: 40rpx;
	right: 60rpx;
}

.cloud-2 {
	width: 70rpx;
	height: 30rpx;
	top: 100rpx;
	left: 40rpx;
}

.hero-illustration {
	margin-bottom: 40rpx;
}

.illus-scene {
	position: relative;
	width: 400rpx;
	height: 260rpx;
}

.nurse {
	position: absolute;
	left: 100rpx;
	bottom: 0;
	width: 120rpx;
	height: 180rpx;
}

.nurse-head {
	position: absolute;
	top: 0;
	left: 28rpx;
	width: 64rpx;
	height: 64rpx;
	background: #ffe8d6;
	border-radius: 50%;
	z-index: 2;
}

.nurse-cap {
	position: absolute;
	top: -6rpx;
	left: 20rpx;
	width: 80rpx;
	height: 32rpx;
	background: #ffffff;
	border-radius: 16rpx 16rpx 4rpx 4rpx;
	z-index: 3;
}

.nurse-body {
	position: absolute;
	top: 56rpx;
	left: 16rpx;
	width: 88rpx;
	height: 100rpx;
	background: #ffffff;
	border-radius: 16rpx;
}

.medicine-box {
	position: absolute;
	left: 0;
	bottom: 20rpx;
	width: 88rpx;
	height: 72rpx;
	background: #6ec1e8;
	border-radius: 12rpx;
}

.box-cross-h,
.box-cross-v {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	background: #ffffff;
	border-radius: 4rpx;
}

.box-cross-h {
	width: 40rpx;
	height: 8rpx;
}

.box-cross-v {
	width: 8rpx;
	height: 40rpx;
}

.pill {
	position: absolute;
	border-radius: 40rpx;
}

.pill-blue {
	width: 48rpx;
	height: 24rpx;
	top: 40rpx;
	right: 40rpx;
	background: linear-gradient(90deg, #6ec1e8 50%, #fff 50%);
}

.pill-red {
	width: 44rpx;
	height: 22rpx;
	top: 80rpx;
	right: 0;
	background: linear-gradient(90deg, #ff8a80 50%, #fff 50%);
}

.calendar {
	position: absolute;
	right: 0;
	bottom: 60rpx;
	width: 64rpx;
	height: 72rpx;
	background: #fff;
	border-radius: 8rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(110, 193, 232, 0.2);
}

.cal-header {
	height: 20rpx;
	background: #6ec1e8;
}

.slogan-wrap {
	text-align: center;
}

.slogan-line1 {
	font-size: 36rpx;
	font-weight: 600;
	color: #1a4a6e;
	display: block;
}

.slogan-line2 {
	font-size: 40rpx;
	font-weight: 700;
	color: #1a4a6e;
	margin-top: 12rpx;
	display: block;
}

.slogan-desc {
	font-size: 26rpx;
	color: #888888;
	margin-top: 16rpx;
	display: block;
}

/* 底部区域 */
.footer-section {
	flex-shrink: 0;
	padding: 32rpx 48rpx;
	padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
	background: #ffffff;
	border-radius: 32rpx 32rpx 0 0;
	box-shadow: 0 -4rpx 20rpx rgba(26, 74, 110, 0.06);
}

.agreement-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 32rpx;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #cccccc;
	border-radius: 8rpx;
	margin-right: 16rpx;
	margin-top: 4rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.checkbox--checked {
	background: #6ec1e8;
	border-color: #6ec1e8;
}

.checkbox-tick {
	font-size: 24rpx;
	color: #ffffff;
	line-height: 1;
}

.agreement-text-wrap {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	line-height: 1.6;
}

.agreement-text {
	font-size: 26rpx;
	color: #666666;
}

.agreement-link {
	font-size: 26rpx;
	color: #4a9fd4;
}

/* 微信登录按钮 */
.btn-wx-login {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(180deg, #6ec1e8 0%, #4a9fd4 100%);
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	box-shadow: 0 8rpx 24rpx rgba(110, 193, 232, 0.4);
}

.btn-wx-login::after {
	border: none;
}

.btn-wx-icon {
	font-size: 28rpx;
	color: #ffffff;
	font-weight: 600;
	margin-right: 12rpx;
	padding: 4rpx 12rpx;
	background: rgba(255, 255, 255, 0.25);
	border-radius: 8rpx;
}

.btn-wx-text {
	font-size: 34rpx;
	color: #ffffff;
	font-weight: 600;
}
</style>
