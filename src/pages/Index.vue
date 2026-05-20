<template>
	<view class="index-page">
		<!-- 顶部用户信息 -->
		<view class="header-section">
			<view class="user-info">
				<view class="avatar-wrap">
					<image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
					<view v-if="userInfo.badge > 0" class="avatar-badge">
						<text class="badge-text">{{ userInfo.badge }}</text>
					</view>
				</view>
				<text class="pending-tip">今日待服药：{{ userInfo.todayPending }}次</text>
			</view>
			<text class="user-name">{{ userInfo.nickName }}</text>
		</view>

		<!-- 功能宫格 -->
		<view class="grid-section">
			<view
				class="grid-item grid-item--primary"
				:class="{ 'grid-item--press': pressedKey === 'ocr' }"
				hover-class="grid-item--hover"
				@touchstart="pressedKey = 'ocr'"
				@touchend="pressedKey = ''"
				@touchcancel="pressedKey = ''"
				@tap="goOcrRecognize"
			>
				<view class="grid-icon grid-icon--ocr">
					<text class="icon-symbol">📷</text>
				</view>
				<text class="grid-label">拍照识别</text>
			</view>

			<view
				class="grid-item grid-item--light"
				:class="{ 'grid-item--press': pressedKey === 'medicine' }"
				hover-class="grid-item--hover"
				@touchstart="pressedKey = 'medicine'"
				@touchend="pressedKey = ''"
				@touchcancel="pressedKey = ''"
				@tap="goMedicineList"
			>
				<view class="grid-icon grid-icon--medicine">
					<text class="icon-symbol">💊</text>
				</view>
				<text class="grid-label">我的用药</text>
			</view>

			<view
				class="grid-item grid-item--light"
				:class="{ 'grid-item--press': pressedKey === 'record' }"
				hover-class="grid-item--hover"
				@touchstart="pressedKey = 'record'"
				@touchend="pressedKey = ''"
				@touchcancel="pressedKey = ''"
				@tap="goTakeRecord"
			>
				<view class="grid-icon grid-icon--record">
					<text class="icon-symbol">📅</text>
				</view>
				<text class="grid-label">服药记录</text>
			</view>

			<view
				class="grid-item grid-item--light"
				:class="{ 'grid-item--press': pressedKey === 'stat' }"
				hover-class="grid-item--hover"
				@touchstart="pressedKey = 'stat'"
				@touchend="pressedKey = ''"
				@touchcancel="pressedKey = ''"
				@tap="goStatistics"
			>
				<view class="grid-icon grid-icon--stat">
					<text class="icon-symbol">📊</text>
				</view>
				<text class="grid-label">统计分析</text>
			</view>
		</view>

		<!-- 当前用药列表 -->
		<view class="medicine-section">
			<text class="section-title">当前用药</text>

			<view
				v-for="item in medicineList"
				:key="item.id"
				class="medicine-card"
				@tap="handleCardTap(item)"
			>
				<view class="card-main">
					<view class="card-title-row">
						<text class="medicine-name">{{ item.medicineName }}</text>
						<text class="card-arrow">›</text>
					</view>
					<text v-if="item.frequency" class="medicine-meta">{{ item.frequency }}</text>
					<text v-if="item.nextRemind" class="medicine-meta">
						下次提醒：{{ item.nextRemind }}
					</text>
				</view>

				<view
					v-if="item.actionType === 'button'"
					class="enable-btn"
					:class="{ 'enable-btn--active': item.enabled }"
					@tap.stop="toggleEnable(item)"
				>
					<text class="enable-btn-text">{{ item.enabled ? '启用' : '禁用' }}</text>
				</view>

				<switch
					v-else
					:checked="item.enabled"
					color="#6ec1e8"
					@change="(e) => onSwitchChange(item, e)"
					@tap.stop
				/>
			</view>
		</view>

		<view class="footer-space"></view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo } from '../utils/auth.js'

/**
 * 页面路由（对应 pages 目录下的 .vue 文件）
 * uni.navigateTo 的 url 不能带 .vue 后缀，需与 pages.json 中 path 一致
 */
const PAGE_ROUTES = {
	ocr: '/pages/OcrRecognize',       // OcrRecognize.vue
	medicine: '/pages/MedicineList',  // MedicineList.vue
	record: '/pages/TakeRecord',      // TakeRecord.vue
	stat: '/pages/Statistics'         // Statistics.vue
}

// 用户信息，从本地缓存读取
const userInfo = ref({
	nickName: '',
	avatar: '',
	todayPending: 0,
	badge: 0
})

const medicineList = ref([
	{
		id: '1',
		medicineName: '布洛芬缓释胶囊',
		frequency: '每日3次 |',
		nextRemind: '',
		enabled: true,
		actionType: 'button'
	},
	{
		id: '2',
		medicineName: '布洛芬缓释胶囊',
		frequency: '',
		nextRemind: '08:00',
		enabled: true,
		actionType: 'switch'
	}
])

const pressedKey = ref('')

/** 页面显示时读取用户信息 */
onShow(() => {
	loadUserInfo()
})

/** 加载用户信息 */
function loadUserInfo() {
	const info = getUserInfo()
	if (info) {
		userInfo.value = {
			nickName: info.nickName || '用户',
			avatar: info.avatar || 'https://via.placeholder.com/120/6ec1e8/ffffff?text=用',
			todayPending: 2,
			badge: 2
		}
	}
}

/** 统一跳转方法 */
function navigateToPage(url) {
	uni.navigateTo({
		url,
		fail: (err) => {
			console.error('页面跳转失败：', url, err)
			uni.showToast({
				title: '页面跳转失败',
				icon: 'none'
			})
		}
	})
}

/** 拍照识别 → OcrRecognize.vue */
function goOcrRecognize() {
	navigateToPage(PAGE_ROUTES.ocr)
}

/** 我的用药 → MedicineList.vue */
function goMedicineList() {
	navigateToPage(PAGE_ROUTES.medicine)
}

/** 服药记录 → TakeRecord.vue */
function goTakeRecord() {
	navigateToPage(PAGE_ROUTES.record)
}

/** 统计分析 → Statistics.vue */
function goStatistics() {
	navigateToPage(PAGE_ROUTES.stat)
}

function handleCardTap(item) {
	console.log('查看药品', item.medicineName)
}

function toggleEnable(item) {
	item.enabled = !item.enabled
}

function onSwitchChange(item, e) {
	item.enabled = e.detail.value
}
</script>

<style scoped>
.index-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #e8f5fc 0%, #f5fafd 280rpx, #ffffff 100%);
	padding: 24rpx 32rpx 0;
	box-sizing: border-box;
}

.header-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 8rpx 32rpx;
}

.user-info {
	display: flex;
	align-items: center;
	flex: 1;
}

.avatar-wrap {
	position: relative;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: #d8edf9;
	border: 4rpx solid #ffffff;
}

.avatar-badge {
	position: absolute;
	top: -4rpx;
	right: -4rpx;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 8rpx;
	background: #ff4d4f;
	border-radius: 18rpx;
	border: 2rpx solid #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.badge-text {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 600;
	line-height: 1;
}

.pending-tip {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a3a52;
	line-height: 1.4;
}

.user-name {
	font-size: 32rpx;
	font-weight: 500;
	color: #333333;
	flex-shrink: 0;
	margin-left: 16rpx;
}

.grid-section {
	display: flex;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 40rpx;
}

.grid-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 28rpx 8rpx 24rpx;
	border-radius: 20rpx;
	transition: transform 0.15s ease, opacity 0.15s ease;
}

.grid-item--hover,
.grid-item--press {
	transform: scale(0.96);
	opacity: 0.88;
}

.grid-item--primary {
	background: #6ec1e8;
	box-shadow: 0 8rpx 20rpx rgba(110, 193, 232, 0.35);
}

.grid-item--light {
	background: #d8edf9;
	box-shadow: 0 4rpx 12rpx rgba(110, 193, 232, 0.12);
}

.grid-icon {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
}

.icon-symbol {
	font-size: 40rpx;
	line-height: 1;
}

.grid-item--primary .grid-label {
	color: #ffffff;
}

.grid-item--light .grid-label {
	color: #2a6a8a;
}

.grid-label {
	font-size: 24rpx;
	font-weight: 500;
	text-align: center;
	line-height: 1.3;
}

.medicine-section {
	padding-bottom: 24rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #1a4a6e;
	margin-bottom: 24rpx;
	display: block;
}

.medicine-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 28rpx 28rpx 28rpx 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(26, 74, 110, 0.08);
}

.card-main {
	flex: 1;
	min-width: 0;
	padding-right: 24rpx;
}

.card-title-row {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}

.medicine-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-arrow {
	font-size: 32rpx;
	color: #cccccc;
	margin-left: 8rpx;
	flex-shrink: 0;
}

.medicine-meta {
	font-size: 26rpx;
	color: #888888;
	line-height: 1.5;
	display: block;
}

.enable-btn {
	flex-shrink: 0;
	padding: 12rpx 28rpx;
	border-radius: 40rpx;
	border: 2rpx solid #6ec1e8;
	background: #ffffff;
}

.enable-btn--active {
	background: #eef8fc;
}

.enable-btn-text {
	font-size: 26rpx;
	color: #6ec1e8;
	font-weight: 500;
}

.medicine-card switch {
	transform: scale(0.9);
	flex-shrink: 0;
}

.footer-space {
	height: 80rpx;
}
</style>
