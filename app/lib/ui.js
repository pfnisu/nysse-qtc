import request from './request.js'

const start = (view, root) => {
    // Replace view with updated tree
    const load = async () => {
        if ('live' in view && view._prev !== window.location.hash)
            view.tree.innerHTML = ''
        root.replaceChildren(view.tree)
        if (!view.tree.innerHTML || view.live || view._prev == null) {
            await view.load()
            view._prev = window.location.hash
        }
        view.start?.()
    }
    view._started = true
    load()
    // Reload is only spawned if view is live and visible
    if (view.live && view._id == null)
        view._id = setInterval(() => {
            if (!document.hidden && !!view.tree.offsetParent) load()
        }, view.live)
}

const stop = (view) => {
    clearInterval(view._id)
    delete view._id
    view._started = null
    view.stop?.()
}

// $()      JQuery-style convenience wrapper for querySelector
// query    Query string
// target   Optional target object which tree is queried,
//          dafault = document tree.
// all      Optional boolean to match all or first element,
//          default = first.
export const $ = (query, target = null, all = false) => {
    const tree = target ? target.tree : document
    if (all) return tree.querySelectorAll(query)
    return tree.querySelector(query)
}

export default {
    // bind()   Bind an array of views to a root element
    // views    Array of unique objects constructed with init()
    // root     Root element
    // nav      Optional navigation element for generating a menu:
    //          Required to have id (i.e. hash param) to allow multiple menus.
    //          Without nav, navigation can be used by giving the element
    //          a href attribute (key=value).
    // title    Optional string used as document title:
    //          Passing title will treat menu as main level.
    //          Used only if also passing nav.
    bind: (views, root, nav = null, title = null) => {
        // Switch to view that matches hash
        const setView = () => {
            for (const v of views) if (v._started) stop(v)
            if (nav) {
                nav.innerHTML = views.reduce((cat, v, i) =>
                    `${cat}<a href="#${nav.id}=${i}">${v.name}</a>`, '')
                const index = request.hash(nav.id) || 0
                nav.children[index].className = 'focus'
                window.scroll(0, 0)
                if (title) document.title = `${views[index].name}${title}`
                start(views[index], root)
            } else start(views.find((v) => request.hash(v.name)) || views[0], root)
        }
        // Change view when history changes
        if (views.length > 1) window.addEventListener('popstate', setView)
        setView()
    },

    // init()   Construct a composable view
    // target   Target object, required to have target.load().
    //          Optional methods target.start() and target.stop()
    //          are called on every view start/stop.
    // name     Unique string used as view id and title in menu
    // live     Optional integer to construct a static or live view:
    //          default = null (static), 0 = on demand, >0 = interval (ms).
    //          Static view is loaded only once.
    // tag      Optional tagName to use as container element of target.tree:
    //          default = div.
    init: (target, name, live = null, tag = 'div') => {
        target.name = name
        if (live !== null) target.live = live
        target.tree = document.createElement(tag)
    },

    // listen() Listen for notifications
    // type     String specifying event type
    // fn       Callback function
    listen: (type, fn) => {
        window.addEventListener(type, fn)
    },

    // notify() Dispatch notifications
    // type     String specifying event type
    // data     Optional data sent as CustomEvent.detail
    notify: (type, data = null) => {
        window.dispatchEvent(new CustomEvent(type, { detail: data }))
    }
}
