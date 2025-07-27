import ui from './lib/ui.js'
import {Search} from './search.js'

// Parent view of Search and Timetable
export function Stops(l, timetable) {
    ui.init(this, l.str.stops)

    this.load = async () => {
        ui.bind([new Search(l), timetable], this.tree)
    }

    ui.listen('lang', () => this.name = l.str.stops)
}
