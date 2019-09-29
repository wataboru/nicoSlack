const Vue = require('vue/dist/vue.js')
const _ = require('lodash')
const { ipcRenderer } = require('electron')
const emoji = require('node-emoji')

const dispatcher = new Vue()

Vue.component('Comment', {
  props: {
    comment: {
      default: ''
    },
    commentId: {
      default: ''
    },
    speed: {
      default: 300
    },
    fontSize: {
      default: 48
    },
    color: {
      default: '#fff'
    },
    position: {
      default: ''
    },
    bottomComments: {
      default: () => []
    }
  },
  data() {
    return {
      transitionName: '',
      width: 0,
      bottomPosition: 0,
    }
  },
  template: `
<div class="comment transition" :class="transformClass" :style="style" ref="comment">
{{ comment }}
</div>
  `,
  computed: {
    style() {
       let styles = {
        ...this.transitionDuration,
         'font-size': this.fontSize + 'px',
         'top': this.topPosition + 'px',
         'color': this.color
      }

      if (this.width) {
        styles = {
          ...styles,
          'left': - (this.width + 30) + 'px'
        }
      }

      const bottomIndex = _.findIndex(this.bottomComments, bottomComment => {
        return bottomComment.id === this.commentId
      })
      if (bottomIndex >= 0) {
        this.bottomPosition = bottomIndex * this.fontSize + 10 + 'px'
      }

      if (this.position === 'bottom') {
        styles = {
          ...styles,
          transitionDuration: 0,
          top: 'auto',
          left: '10px',
          bottom: this.bottomPosition,
          width: 'calc(100% - 20px)',
          textAlign: 'center',
          whiteSpace: 'normal',
        }
      }

      return styles
    },
    transformClass() {
      return 'transform-' + this.transitionName
    },
    transitionDuration() {
      const w = window.innerWidth
      return {
        transitionDuration: (w + this.width) / this.speed + 's'
      }
    },
    topPosition() {
      const position = Math.random() * (window.innerHeight - this.fontSize - 100)
      return position < 0 ? 0 : position
    }
  },
  created() {
    this.transitionName = 'default'
  },
  mounted() {
    const $comment = this.$refs.comment
    this.width = $comment.clientWidth
    if (this.position !== '') {
      setTimeout(() => {
        this.$emit('outOfWindow', this.commentId)
      }, 4000)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        this.$emit('outOfWindow', this.commentId)
      }
    } ,{
      root: document.body
    })
    observer.observe($comment)
  }
})

const App = new Vue({
  el: '#app',
  data() {
    return {
      comments: []
    }
  },
  template: `
<div class="comments">
    <comment 
      v-for="comment in comments" 
      :key="comment.id" 
      :comment="comment.text" 
      :comment-id="comment.id" 
      :font-size="comment.fontSize" 
      :color="comment.color" 
      :speed="comment.speed" 
      :position="comment.position" 
      :bottom-comments="bottomComments"
      v-on:outOfWindow="remove" 
    />
</div>
  `,
  computed: {
    bottomComments() {
      return _.filter(this.comments, comment => {
        return comment.position === 'bottom'
      })
    },
  },
  methods: {
    remove(commentId) {
      this.comments = _.filter(this.comments, (comment) => {
        return comment.id !== commentId
      })
    }
  },
  created() {
    dispatcher.$on('send', (comment) => {
      const date = new Date()
      const unixTime = date.getTime()
      const _comment = comment.replace(/　/g, ' ')
      const commentData = _comment.split(' ')

      let commentObject = {
        id: unixTime,
        text: _comment
      }

      const simpleStyle = commentData[0]
      const detailStyle = commentData[commentData.length - 1]

      // font-size指定
      if (!isNaN(+simpleStyle) && _.isNumber(+simpleStyle)) {
        commentData.splice(0, 1)
        commentObject = {
          ...commentObject,
          fontSize: simpleStyle,
          text: commentData.join(' ')
        }
      }

      if(_.indexOf(colorNames, simpleStyle) >= 0) {
        commentData.splice(0, 1)
        commentObject = {
          ...commentObject,
          color: simpleStyle,
          text: commentData.join(' ')
        }
      }

      const removeIndexes = []
      _.each(commentData, (data, i) => {
        const setting = data.match(/:(.*)=(.*)/)
        if (setting) {
          if(setting[1] === 'color') {
            removeIndexes.push(i)
            commentObject = {
              ...commentObject,
              color: setting[2]
            }
          }
          if(setting[1] === 'fontSize') {
            removeIndexes.push(i)
            commentObject = {
              ...commentObject,
              fontSize: setting[2]
            }
          }

          if(setting[1] === 'speed') {
            removeIndexes.push(i)
            commentObject = {
              ...commentObject,
              speed: !isNaN(+setting[2]) ? +setting[2] : 150
            }
          }

          if(setting[1] === 'position') {
            removeIndexes.push(i)
            commentObject = {
              ...commentObject,
              position: setting[2]
            }
          }
        }
      })

      if (removeIndexes.length > 0) {
        _(removeIndexes).orderBy(null, 'desc').each(removeIndex => {
          commentData.splice(removeIndex, 1)
        })
        commentObject = {
          ...commentObject,
          text: commentData.join(' ')
        }
      }

      this.comments.push(commentObject)
    })
  }
})

ipcRenderer.on('slackContent', (event, arg) => {
    // nicoSlack.send();
  dispatcher.$emit('send', emoji.emojify(arg))
});

const colorNames = [
  'aliceblue',
  'lightgreen',
  'antiquewhite',
  'lightgrey',
  'aqua',
  'lightpink',
  'aquamarine',
  'lightsalmon',
  'azure',
  'lightseagreen',
  'beige',
  'lightskyblue',
  'bisque',
  'lightslategray',
  'black',
  'lightsteelblue',
  'blanchedalmond',
  'lightyellow',
  'blue',
  'lime',
  'blueviolet',
  'limegreen',
  'brass',
  'linen',
  'brown',
  'magenta',
  'burlywood',
  'maroon',
  'cadetblue',
  'mediumaquamarine',
  'chartreuse',
  'mediumblue',
  'chocolate',
  'mediumorchid',
  'coolcopper',
  'mediumpurple',
  'copper',
  'mediumseagreen',
  'coral',
  'mediumslateblue',
  'cornflower',
  'mediumspringgreen',
  'cornflowerblue',
  'mediumturquoise',
  'cornsilk',
  'mediumvioletred',
  'crimson',
  'midnightblue',
  'cyan',
  'mintcream',
  'darkblue',
  'mistyrose',
  'darkbrown',
  'moccasin',
  'darkcyan',
  'navajowhite',
  'darkgoldenrod',
  'navy',
  'darkgray',
  'oldlace',
  'darkgreen',
  'olive',
  'darkkhaki',
  'olivedrab',
  'darkmagenta',
  'orange',
  'darkolivegreen',
  'orangered',
  'darkorange',
  'orchid',
  'darkorchid',
  'palegoldenrod',
  'darkred',
  'palegreen',
  'darksalmon',
  'paleturquoise',
  'darkseagreen',
  'palevioletred',
  'darkslateblue',
  'papayawhip',
  'darkslategray',
  'peachpuff',
  'darkturquoise',
  'peru',
  'darkviolet',
  'pink',
  'deeppink',
  'plum',
  'deepskyblue',
  'powderblue',
  'dimgray',
  'purple',
  'dodgerblue',
  'red',
  'feldsper',
  'richblue',
  'firebrick',
  'rosybrown',
  'floralwhite',
  'royalblue',
  'forestgreen',
  'saddlebrown',
  'fuchsia',
  'salmon',
  'gainsboro',
  'sandybrown',
  'ghostwhite',
  'seagreen',
  'gold',
  'seashell',
  'goldenrod',
  'sienna',
  'gray',
  'silver',
  'green',
  'skyblue',
  'greenyellow',
  'slateblue',
  'honeydew',
  'slategray',
  'hotpink',
  'snow',
  'indianred',
  'springgreen',
  'indigo',
  'steelblue',
  'ivory',
  'tan',
  'khaki',
  'teal',
  'lavender',
  'thistle',
  'lavenderblush',
  'tomato',
  'lawngreen',
  'turquoise',
  'lemonchiffon',
  'violet',
  'lightblue',
  'wheat',
  'lightcoral',
  'white',
  'lightcyan',
  'whitesmoke',
  'lightgoldenrodyellow',
  'yellow',
  'yellowgreen'
]