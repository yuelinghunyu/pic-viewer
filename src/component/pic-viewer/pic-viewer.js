import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import store from '@/redux/index'
import classNames from 'classnames'
import { boundClosePicViewer } from '@/redux/actions'
import Swiper from 'swiper'
import "swiper/css/swiper.min.css"
import Hammer from 'hammerjs'
import VConsole from 'vconsole/dist/vconsole.min.js'
import "./pic-viewer.scss"
import { getStyle, stylePrefix, getTransformAttr} from "@/plugin/utils"
new VConsole()


class PicViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hammerList: [],
    }
  }

  componentDidMount() {
    // 初始化swiper
    new Swiper(ReactDOM.findDOMNode(this.swiper), {
      initialSlide: this.props.currentIndex
    })
    // 初始化slide 和 img
    const swiperSlide = document.getElementsByClassName("swiper-slide")
    const hammerList = []
    Array.from(swiperSlide).forEach(slide => {
      const hammer = new Hammer(slide)
      hammer.get('pan').set({ enable: true })
      hammer.get('pinch').set({ enable: true })
      hammerList.push(hammer)
      this.updateGestrueEvent(hammer)
    })
  }
  // 监听当前dom的手势事件
  updateGestrueEvent(hammer) {
    hammer.on('pinchstart pinchin pinchout', (ev) => {
      const type = ev.type
      const target = ev.target
      let initScale = 1
      if(type === 'pinchstart') {
        initScale = getTransformAttr(getStyle(target, "transform"), "scale") || 1
        console.log("initScale1", initScale)
      }
      if(type === 'pinchout') {
        console.log("initScale2", initScale)
        target.style.transform = `scale(${ev.scale * initScale})`
      }
    })
  }
  // 关闭遮罩层
  handleCloseEvent() {
    store.dispatch(boundClosePicViewer(true))
  }
  render() {
    let { urlList } = this.props
    return (
      <div className="pic-viewer_container">
        <span
          className="pic-viewer_close iconfont icon-guanbi"
          onClick={this.handleCloseEvent}
        ></span>
        <div
          className="pic-viewer_swiper-container"
          ref={el => this.swiper = el}
        >
          <div className="swiper-wrapper">
            {
              urlList.length ?
                urlList.map((url, index) => {
                  return (
                    <div
                      className={classNames("swiper-slide", { 'swiper-no-swiping': false })}
                      key={index}
                    >
                      <img
                        className="swiper-slide-img"
                        src={url}
                      />
                    </div>
                  )
                }) : null
            }
          </div>
        </div>
        <div className="pic-viewer_operate">
          <span
            className="pic-viewer_operate-scale"
          >
            <i
              className="iconfont icon-jia"
            ></i>
            <i
              className="iconfont icon-jian"
            ></i>
          </span>
        </div>
      </div>
    )
  }
}
PicViewer.propTypes = {
  urlList: PropTypes.array,
  currentIndex: PropTypes.number
}

PicViewer.instance = (option) => {
  let props = option || {}
  let div = document.createElement("div")
  div.className = "pic-viewer"
  document.body.appendChild(div)
  ReactDOM.render(React.createElement(PicViewer, props), div)
  return {
    destroy() {
      ReactDOM.unmountComponentAtNode(div)
      document.body.removeChild(div)
    }
  }
}
export default PicViewer