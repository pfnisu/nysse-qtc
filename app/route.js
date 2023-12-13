import ui from './lib/ui.js'
import request from './lib/request.js'

export function Route(api) {
    ui.init(this, 'route')

    this.compose = async () => {
        const rid = request.hash(this.title)
        const query = {
            'query': `{
                route(id: "tampere:${rid}") {
                    longName
                    stops {
                        gtfsId
                        name
                    }
                }
            }`
        }
        let json = await request.http(api.uri, 'POST', query, api.key)
        if (json) {
            document.title = `${rid} ${json.data.route.longName} | ${document.title}`
            this.tree.innerHTML =
                `<h1>${rid} ${json.data.route.longName}</h1>
                <table></table>`
            const content = this.tree.querySelector('table')
            for (const stop of json.data.route.stops) {
                const sid = stop.gtfsId.split(':')[1]
                content.innerHTML += 
                    `<tr>
                        <td>${sid}</td>
                        <td><a href="#p=1;stop=${sid}">${stop.name}</a></td>
                    </tr>`
            }
        } else this.tree.innerHTML = '<h1>Yhteysvirhe...</h1>'
    }
}
