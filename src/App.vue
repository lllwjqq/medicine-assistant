<script>
import { checkLoginAndRedirect } from './utils/auth.js'

export default {
	onLaunch() {
		// 启动时校验登录态，未登录强制进入登录页
		checkLoginAndRedirect()
	},
	onShow() {
		// 每次显示应用时校验，防止绕过登录
		checkLoginAndRedirect()
	}
}
</script>

<style>
/* 每个页面公共 css */
</style>
