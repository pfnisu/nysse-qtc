import ui from './lib/ui.js'
import {List} from './list.js'

// Parent view of List and Route
export function Lines(l, route) {
    ui.init(this, l.str.lines)

    this.load = async () => {
        ui.bind([new List(l), route], this.tree)
    }

    ui.listen('lang', () => this.name = l.str.lines)
}
