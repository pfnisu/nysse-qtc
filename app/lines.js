import ui from './lib/ui.js'
import {List} from './list.js'
import {Route} from './route.js'

export function Lines(listen) {
    ui.init(this, 'Linjat', false)

    this.tree.innerHTML = '<div></div>'
    this.compose = async () => {
        ui.bind([new List(listen), new Route()], this.tree.querySelector('div'))
    }
}
