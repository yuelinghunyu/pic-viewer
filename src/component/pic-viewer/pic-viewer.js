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
new VConsole()


class PicViewer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hammerList: [],
      initScale: 1,
      tMatrix: [1,0,0,1,0,0], //x缩放，无，无，y缩放，x平移，y平移
      poscenter: this.point2D(0, 0), //缓存双指的中心坐标
      lastTranslate: this.point2D(0, 0), //记录上次的偏移值
      lastcenter: this.point2D(0, 0), //图像的中心点，用于对比双指中心点
      center: this.point2D(0, 0),
      duration: "",
      maxHeight: 0,
      swiperDisable: false
    }
  }
  point2D(x, y) {
    return {x: x, y: y}
  }
  componentDidMount() {
    // 初始化swiper
    new Swiper(ReactDOM.findDOMNode(this.swiper), {
      initialSlide: this.props.currentIndex,
      on: {
        slideChangeTransitionEnd: () => {
          this.handleTransitionEnd()
        }
      }
    })
    // 初始化slide 和 img
    const swiperSlide = document.getElementsByClassName("swiper-slide")
    const hammerList = []
    Array.from(swiperSlide).forEach(slide => {
      const hammer = new Hammer(slide)
      hammer.get('pan').set({ enable: true,direction: Hammer.DIRECTION_ALL })
      hammer.get('pinch').set({ enable: true,direction: Hammer.DIRECTION_ALL })
      hammerList.push(hammer)
      this.updateGestrueEvent(hammer)
    })
    this.setState({
      center: this.point2D(swiperSlide[0].offsetWidth/2, swiperSlide[0].offsetHeight/2),
      maxHeight: swiperSlide[0].offsetHeight
    }, () => {
      // console.log(this.state.center)
      // console.log(this.state.maxHeight)
    })
  }
  // 监听当前dom的手势事件
  updateGestrueEvent(hammer) {
    hammer.on('panstart', (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      this.setState({
        lastTranslate: this.point2D(this.state.tMatrix[4], this.state.tMatrix[5]) //缓存上一次的偏移值
      })
    })
    hammer.on("panmove", (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      const target = ev.target
      let duration = ""
      let tMatrix = this.state.tMatrix
      let swiperDisable = this.state.swiperDisable
      const borderX = this.state.center.x * (tMatrix[0] - 1)
      tMatrix[4] = this.state.lastTranslate.x + ev.deltaX
      if(Math.abs(tMatrix[4]) > borderX) { // 这是x方向的边界
        if(tMatrix[4] > 0) {
          tMatrix[4] = borderX
        } else {
          tMatrix[4] = -borderX
        }
        swiperDisable = false
      } else {
        swiperDisable = true
      }
      console.log(tMatrix[4])
      console.log(ev.direction)
      tMatrix[5] = this.state.lastTranslate.y + ev.deltaY
      this.setState({
        tMatrix: tMatrix,
        duration: duration,
        swiperDisable: swiperDisable,
      }, () => {
        console.log(this.state.swiperDisable)
        target.style.transition = this.state.duration
        target.style.transform = `matrix(${this.state.tMatrix.join(",")})`
        console.log(this.swiperSlide)
      })
    })
    hammer.on('pinchstart', (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      const initScale = this.state.tMatrix[0] || 1// 记录上一次的scale值
      const lastTranslate = this.point2D(this.state.tMatrix[4], this.state.tMatrix[5]) // 记录上次的偏移值
      let poscenter = this.point2D(ev.center.x, ev.center.y)
      const lastcenter = this.point2D(this.state.center.x + lastTranslate.x, this.state.center.y + lastTranslate.y)//重新计算放大后的中心坐标
      poscenter = this.point2D(ev.center.x - lastcenter.x, ev.center.y-lastcenter.y)
      this.setState({
        initScale: initScale, 
        lastTranslate: lastTranslate, // 记录上次的偏移值
        poscenter: poscenter,
        lastcenter: lastcenter,
        duration: ""
      })
    })
    hammer.on('pinchmove', (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      let tMatrix = this.state.tMatrix
      const target = ev.target
      tMatrix[0] = tMatrix[3] = this.state.initScale * ev.scale
      tMatrix[4] = (1 - ev.scale) * this.state.poscenter.x + this.state.lastTranslate.x
      tMatrix[5] = (1 - ev.scale) * this.state.poscenter.y + this.state.lastTranslate.y
      this.setState({
        tMatrix: tMatrix,
        duration: "",
        swiperDisable: true
      }, () => {
        target.style.transition = this.state.duration
        target.style.transform = `matrix(${this.state.tMatrix.join(",")})`
      })
    })
    hammer.on('panend', (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      this.endReset(ev)
    })
    hammer.on('pinchend', (ev) => {
      if(!ev.target.classList.contains("swiper-slide-img")) return false
      this.endReset(ev)
    })
  }
  handleTransitionEnd() {
    this.setState({
      initScale: 1,
      tMatrix: [1,0,0,1,0,0], //x缩放，无，无，y缩放，x平移，y平移
      poscenter: this.point2D(0, 0), //缓存双指的中心坐标
      lastTranslate: this.point2D(0, 0), //记录上次的偏移值
      lastcenter: this.point2D(0, 0), //图像的中心点，用于对比双指中心点
      duration: "",
      swiperDisable: false
    }, () => {
      const swiperSlideImgs = document.getElementsByClassName("swiper-slide-img")
      Array.from(swiperSlideImgs).forEach(img => {
        img.style.transform = `matrix(${this.state.tMatrix.join(",")})`
      })
    })
  }
  endReset(ev){
    let tMatrix = this.state.tMatrix
    const target = ev.target
    const originHeight = target.offsetHeight
    let swiperDisable = this.state.swiperDisable
    let scale = 1
    if(tMatrix[0] <= 1) {
      tMatrix[0] = tMatrix[3] = 1
      tMatrix[4] = tMatrix[5] = 0
      swiperDisable = false
    } else {
      tMatrix[0] = tMatrix[3] = tMatrix[0] <= 3 ? tMatrix[0] : 3
      if(originHeight * tMatrix[0] > this.state.maxHeight) {
        const borderY = Math.abs(originHeight / 2 * tMatrix[0] - this.state.center.y)
        if(Math.abs(tMatrix[5]) >= borderY) {
          if(tMatrix[5] > 0) {
            tMatrix[5] = borderY
          } else {
            tMatrix[5] = -borderY
          }
        }
      }
      if(originHeight * tMatrix[0] <= this.state.maxHeight) {
        tMatrix[5] = 0
      }
      scale = tMatrix[0]
    }
    // console.log(tMatrix.join(","))
    this.setState({
      initScale: scale,
      tMatrix: tMatrix,
      duration: ".3s ease all",
      swiperDisable: swiperDisable
    }, () => {
      target.style.transition = this.state.duration
      target.style.transform = `matrix(${this.state.tMatrix.join(",")})`
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
                      className={classNames("swiper-slide", { 'swiper-no-swiping': this.state.swiperDisable })}
                      key={index}
                      ref={el => this.swiperSlide = el}
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
        {/* <div className="pic-viewer_operate">
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
        </div> */}
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