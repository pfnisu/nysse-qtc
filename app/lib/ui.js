import request from './request.js'

const start = (view, root) => {
    // Replace view with updated tree
    const load = async () => {
        if ('live' in view && view.prev !== window.location.hash)
            view.tree.innerHTML = ''
        root.replaceChildren(view.tree)
        if ('live' in view || !('prev' in view)) {
            await view.compose()
            view.prev = window.location.hash
        }
    }
    view.started = true
    load()
    // Reload is only spawned if view is live and visible
    if (view.live && !('id' in view))
        view.id = setInterval(() => {
            if (!document.hidden && !!view.tree.offsetParent) load()
        }, view.live)
}

const stop = (view) => {
    clearInterval(view.id)
    delete view.id
    view.started = null
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
            for (const v of views) if (v.started) stop(v)
            if (nav) {
                nav.innerHTML = views.reduce((cat, v, i) =>
                    `${cat}<a href="#${nav.id}=${i}">${v.title}</a>`, '')
                const index = request.hash(nav.id) ?? 0
                nav.children[index].className = 'active'
                window.scroll(0, 0)
                if (title) document.title = `${views[index].title}${title}`
                start(views[index], root)
            } else start(views.find((v) => request.hash(v.title)) || views[0], root)
        }
        // Change view when history changes
        if (views.length > 1) window.addEventListener('popstate', setView)
        setView()
    },

    // init()   Construct a composable view
    // target   Target object, required to have target.compose()
    // title    Unique string used as view id and title in menu
    // live     Optional integer to construct a static or live view:
    //          default = null (static), 0 = on demand, >0 = reload interval.
    //          Static view is composed only once.
    // tag      Optional tagName to use as container element of target.tree:
    //          default = div.
    init: (target, title, live = null, tag = 'div') => {
        target.title = title
        if (live !== null) target.live = live
        target.tree = document.createElement(tag)
        // Subscribe to notifications from target object
        target.listen = (fn) => {
            target.listeners ??= []
            target.listeners.push(fn)
        }
        target.notify = () => {
            if (target.listeners) for (const fn of target.listeners) fn()
        }
    }
}
