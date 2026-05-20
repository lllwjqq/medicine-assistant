/**
 * 本地登录态管理
 * 存储字段：userId、nickName、avatar、token
 */

/**
 * 是否已登录（存在有效token）
 */
export function isLoggedIn() {
	try {
		const token = uni.getStorageSync('token')
		return !!token
	} catch (e) {
		return false
	}
}

/**
 * 保存登录信息到本地
 * @param {Object} loginData - 登录接口返回的数据
 * @param {string} loginData.userId - 用户ID
 * @param {string} loginData.nickName - 用户昵称
 * @param {string} loginData.avatar - 用户头像
 * @param {string} loginData.token - 访问令牌
 */
export function saveUserInfo(loginData) {
	try {
		uni.setStorageSync('userId', loginData.userId || '')
		uni.setStorageSync('nickName', loginData.nickName || '微信用户')
		uni.setStorageSync('avatar', loginData.avatar || '')
		uni.setStorageSync('token', loginData.token || '')
	} catch (e) {
		console.error('保存登录信息失败:', e)
	}
}

/**
 * 读取本地用户信息
 * @returns {Object|null} 用户信息对象
 */
export function getUserInfo() {
	try {
		const userId = uni.getStorageSync('userId')
		const nickName = uni.getStorageSync('nickName')
		const avatar = uni.getStorageSync('avatar')
		const token = uni.getStorageSync('token')

		if (!token) {
			return null
		}

		return {
			userId,
			nickName,
			avatar,
			token
		}
	} catch (e) {
		console.error('读取用户信息失败:', e)
		return null
	}
}

/**
 * 获取用户ID
 */
export function getUserId() {
	try {
		return uni.getStorageSync('userId') || ''
	} catch (e) {
		return ''
	}
}

/**
 * 获取Token
 */
export function getToken() {
	try {
		return uni.getStorageSync('token') || ''
	} catch (e) {
		return ''
	}
}

/**
 * 清除登录信息
 */
export function clearUserInfo() {
	try {
		uni.removeStorageSync('userId')
		uni.removeStorageSync('nickName')
		uni.removeStorageSync('avatar')
		uni.removeStorageSync('token')
	} catch (e) {
		console.error('清除登录信息失败:', e)
	}
}

/**
 * 全局登录拦截：未登录且不在登录页时，强制跳转登录
 */
export function checkLoginAndRedirect() {
	const pages = getCurrentPages()
	if (!pages.length) return

	const route = pages[pages.length - 1].route || ''
	// 登录页不拦截
	if (route === 'pages/Login' || route.endsWith('/Login')) return

	if (!isLoggedIn()) {
		uni.reLaunch({ url: '/pages/Login' })
	}
}
