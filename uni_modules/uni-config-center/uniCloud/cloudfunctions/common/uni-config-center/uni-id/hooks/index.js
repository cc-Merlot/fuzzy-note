// 钩子函数示例 hooks/index.js
function beforeRegister({
	userRecord,
	clientInfo
} = {}) {
	if (!userRecord.nickname) {
		userRecord.nickname = "铲屎官" + Math.random().toString(36).substring(3, 9)
	}
	return userRecord
}

module.exports = {
	beforeRegister
}