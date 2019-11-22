// 获取属性值兼容写法
const getStyle = (obj, attr) => {
  if(obj.currentStyle){ 
    return obj.currentStyle[attr]
  } else{ 
    return document.defaultView.getComputedStyle(obj,null)[attr]
  } 
}
// 设置前端前缀
const stylePrefix = (style) => {
  const styleTest = document.createElement('div').style
  const render = {
    webkit: 'webkitTransform',
    ms: 'msTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    standard: 'transform'
  }

  const getPrefix = (() => {
    for (let key in render) {
      if (styleTest[render[key]] !== undefined) {
        return key
      }
    }
  })()
  if(getPrefix === 'standard') {
    return style
  }
  return getPrefix + style.charAt(0).toUpperCase() + style.substr(1)
}
// 获取transform的值
const getTransformAttr = (transform, attr) => {
  if(transform === 'none') return
  const lg = transform.length
  const matrix = transform.substring(7, lg-1)
  const matrixList = matrix.split(",")
  if(attr === "scale") {
    return matrixList[0]
  }
}
export {
  getStyle,
  stylePrefix,
  getTransformAttr
}