import request from './request.js'

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
            for (const v of views) if (v.started) v.stop()
            if (nav) {
                nav.innerHTML = views.reduce((cat, v, i) =>
                    `${cat}<a href="#${nav.id}=${i}">${v.title}</a>`, '')
                const index = request.hash(nav.id) ?? 0
                nav.children[index].className = 'active'
                window.scroll(0, 0)
                if (title) document.title = `${views[index].title}${title}`
                views[index].start(root)
            } else (views.find((v) => request.hash(v.title)) || views[0]).start(root)
        }
        // Change view when hash changes
        if (views.length > 1) window.addEventListener('popstate', setView)
        setView()
    },

    // init()   Construct a composable view
    // target   Target object, required to have target.compose()
    // title    Unique string used as view id and title in menu
    // live     Optional boolean to construct a live or static view:
    //          Live view uses target.interval, default = 0 (i.e. on demand).
    //          Static view is composed only once.
    // tag      Optional tagName to use as container element of target.tree,
    //          default = div.
    init: (target, title, live = true, tag = 'div') => {
        target.title = title
        target.tree = document.createElement(tag)
        // Replace view with updated tree
        const load = async (root) => {
            root.replaceChildren(target.tree)
            if (!target.loaded) await target.compose()
            if (!live) target.loaded = true
        }
        // Reload is only spawned if view is live and visible
        target.start = (root) => {
            target.started = true
            load(root)
            const interval = target.interval ?? 0
            if (live && interval && !target.id)
                target.id = setInterval(() => {
                    if (!document.hidden && !!target.tree.offsetParent) load(root)
                }, interval)
        }
        target.stop = () => {
            clearInterval(target.id)
            target.id = null
            target.started = null
        }
        // Subscribe to notifications from target object
        target.listen = (fn) => {
            target.listeners ??= []
            target.listeners.push(fn)
        }
        target.notify = (data = null) => {
            if (target.listeners) for (const fn of target.listeners) fn(data)
        }
    }
}
