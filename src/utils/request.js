/**
 * 统一网络请求封装
 * 基于uni.request，统一处理请求头、token、错误码等
 */

// API根路径
const BASE_URL = '/api/medicineBox'

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（不含BASE_URL）
 * @param {string} options.method - 请求方法 GET/POST/DELETE等
 * @param {Object} options.data - 请求数据
 * @param {boolean} options.needToken - 是否需要携带token，默认true
 * @param {boolean} options.showLoading - 是否显示加载提示，默认true
 * @returns {Promise} 返回Promise对象
 */
export function request(options) {
	const {
		url,
		method = 'GET',
		data = {},
		needToken = true,
		showLoading = true
	} = options

	// 显示加载提示
	if (showLoading) {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})
	}

	return new Promise((resolve, reject) => {
		// 构建请求头
		const header = {
			'Content-Type': 'application/json'
		}

		// 如果需要token，从本地存储获取并添加到请求头
		if (needToken) {
			try {
				const token = uni.getStorageSync('token')
				if (token) {
					header['Authorization'] = `Bearer ${token}`
				}
			} catch (e) {
				console.error('获取token失败:', e)
			}
		}

		// 发起请求
		uni.request({
			url: BASE_URL + url,
			method,
			data,
			header,
			success: (res) => {
				// 隐藏加载提示
				if (showLoading) {
					uni.hideLoading()
				}

				// 解析响应数据
				const { code, msg, data } = res.data

				// 根据状态码处理
				if (code === 200) {
					// 请求成功
					resolve(data)
				} else if (code === 400) {
					// 参数错误
					uni.showToast({
						title: msg || '参数错误',
						icon: 'none',
						duration: 2000
					})
					reject(new Error(msg || '参数错误'))
				} else if (code === 401) {
					// 未授权，token失效
					uni.showToast({
						title: msg || '登录已过期，请重新登录',
						icon: 'none',
						duration: 2000
					})
					// 清空本地登录信息
					clearLoginInfo()
					// 强制跳转登录页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/Login'
						})
					}, 2000)
					reject(new Error(msg || '未授权'))
				} else if (code === 500) {
					// 服务器异常
					uni.showToast({
						title: msg || '服务器异常，请稍后重试',
						icon: 'none',
						duration: 2000
					})
					reject(new Error(msg || '服务器异常'))
				} else {
					// 其他错误
					uni.showToast({
						title: msg || '请求失败',
						icon: 'none',
						duration: 2000
					})
					reject(new Error(msg || '请求失败'))
				}
			},
			fail: (err) => {
				// 隐藏加载提示
				if (showLoading) {
					uni.hideLoading()
				}

				// 网络错误
				uni.showToast({
					title: '网络连接失败，请检查网络',
					icon: 'none',
					duration: 2000
				})
				reject(err)
			}
		})
	})
}

/**
 * 清空登录信息
 */
function clearLoginInfo() {
	try {
		uni.removeStorageSync('userId')
		uni.removeStorageSync('nickName')
		uni.removeStorageSync('avatar')
		uni.removeStorageSync('token')
	} catch (e) {
		console.error('清空登录信息失败:', e)
	}
}

/**
 * GET请求快捷方法
 */
export function get(url, data = {}, options = {}) {
	return request({
		url,
		method: 'GET',
		data,
		...options
	})
}

/**
 * POST请求快捷方法
 */
export function post(url, data = {}, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

/**
 * DELETE请求快捷方法
 */
export function del(url, data = {}, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}
