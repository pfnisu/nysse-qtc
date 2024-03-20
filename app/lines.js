import ui from './lib/ui.js'
import {List} from './list.js'
import {Route} from './route.js'

// Parent view of List and Route
export function Lines(l) {
    ui.init(this, l.str.lines)

    this.compose = async () => {
        ui.bind([new List(l), new Route(l)], this.tree)
    }

    ui.listen('lang', () => this.title = l.str.lines)
}
