import ui from './lib/ui.js'
import {List} from './list.js'
import {Route} from './route.js'

export function Lines(l, listenLang, listenHome) {
    ui.init(this, l.str.lines, false)

    this.compose = async () => {
        ui.bind([new List(l, listenLang, listenHome), new Route(l)], this.tree)
    }
    listenLang(() => this.title = l.str.lines)
}
