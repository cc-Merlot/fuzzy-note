let {
	result
} = require("utils")
let dbJQL = uniCloud.databaseForJQL();

module.exports = {
	_before: function() { // 通用预处理器
		const clientInfo = this.getClientInfo();
		dbJQL = uniCloud.databaseForJQL({
			clientInfo
		});
	},
	async add(param = {}) {
		try {
			// 生成一个50-100的随机数
			const randomInt = Math.floor(Math.random() * (51)) + 50;
			param.view_count = randomInt
			let {
				errCode,
				errMsg,
				id
			} = await dbJQL.collection("fuzzy-news-articles").add(param);
			if (errCode !== 0) return result({
				errCode: 400,
				errMsg: "error",
				custom: errMsg
			})
			return result({
				errCode: 0,
				errMsg: "success",
				data: {
					id
				}
			})
		} catch (err) {
			return result({
				errCode: 500,
				errMsg: "bug",
				custom: err
			})
		}

	},
	async list() {
		return await dbJQL.collection("xxm-activity-banner").get();
	}
}