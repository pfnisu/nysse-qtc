import ui from './lib/ui.js'
import {List} from './list.js'
import {Route} from './route.js'

export function Lines(l, listen) {
    ui.init(this, l.str.lines, false)

    this.compose = async () => {
        ui.bind([new List(l, listen), new Route(l)], this.tree)
    }
    l.listen(() => this.title = l.str.lines)
}
