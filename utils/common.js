import dayjs from 'dayjs';
import XEUtils from 'xe-utils'

//上传单张图片
export const uploadFileItem = async (url, rootPath = 'admin') => {
  let tempurl = url;
  return await uniCloud.uploadFile({
    filePath: tempurl,
    cloudPath: rootPath + '/' + dayjs().format('YYYYMMDD') + '/' + Date.now() + '.webp',
    cloudPathAsRealPath: true
  });
};


// 获取页面路径及参数
export function getPageAndParams() {
  let { route, options } = getCurrentPages()[getCurrentPages().length - 1];
  let result = '/' + route + '?' + XEUtils.serialize(options);
  return encodeURIComponent(result);
}

/**
 * 显示确认对话框
 * @param {string} title - 提示内容
 * @param {string} [confirmText='确认'] - 确认按钮文字
 * @param {string} [cancelText='取消'] - 取消按钮文字
 * @returns {Promise<boolean>} true表示确认，false表示取消
 */
export function showModal(title, confirmText = '确认', cancelText = '取消') {
  return new Promise((resolve) => {
    uni.showModal({
      title: '提示',
      content: title,
      confirmText,
      cancelText,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        // 如果对话框显示失败（如在小程序某些场景下），默认返回取消
        resolve(false);
      }
    });
  });
}
