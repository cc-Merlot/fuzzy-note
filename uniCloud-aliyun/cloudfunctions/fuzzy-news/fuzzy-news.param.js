// 本文件中的内容将在云对象【运行】时解析为运行参数
// 配置教程参考：https://uniapp.dcloud.net.cn/uniCloud/rundebug.html#run-obj-param

const clientInfo = { // 模拟clientInfo
	clientIP: '127.0.0.1', // 客户端ip，不传时默认为 127.0.0.1
	uniIdToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2OTJlNTAzYWJkMDIyMDRhOGE0MjI4ZmYiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJ1bmlJZFZlcnNpb24iOiIxLjAuMTgiLCJpYXQiOjE3NjQ2NTkyODcsImV4cCI6MTc2NDkxODQ4N30.G0KU8w0grJMNB4lOz7YtKmoPFU_v6d1OVumq7N_XJnQ'
}
add({
	title: "测试",
	content: "内容"
});