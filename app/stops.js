import ui from './lib/ui.js'
import request from './lib/request.js'

export function Stops(api) {
    ui.init(this, 'Pysäkit')
    this.interval = 30000

    this.compose = async () => {
        const sid = request.hash('stop')
        const query = {
            'query': `{
                stop(id: "tampere:${sid}") {
                    name
                    stoptimesWithoutPatterns(timeRange: 86400, numberOfDepartures: 20) {
                        scheduledArrival
                        realtimeArrival
                        trip {
                            route {
                                shortName
                                longName
                            }
                        }
                    }
                }
            }`
        }
        if (sid) {
            let json = await request.http(api.uri, 'POST', query, api.key)
            if (json) {
                this.tree.innerHTML =
                    `<h1>${sid} ${json.data.stop.name}</h1>
                    <table></table>`
                const content = this.tree.querySelector('table')
                for (const stop of json.data.stop.stoptimesWithoutPatterns) {
                    const time = new Date(stop.scheduledArrival * 1000)
                    content.innerHTML += 
                        `<tr><td>${time.toUTCString().split(' ')[4]}</td>
                        <th>${stop.trip.route.shortName}</th>
                        <td>
                            <a href="#p=0;route=${stop.trip.route.shortName}">
                                ${stop.trip.route.longName}
                            </a>
                        </td>`
                }
            } else this.tree.innerHTML = '<h1>Yhteysvirhe...</h1>'
        } else this.tree.innerHTML = 
            `<h1>Etsi pysäkkejä nimellä tai koodilla</h1>
            <form>
                <input type="text" placeholder="Ei toimi vielä..."/>
                <button>Hae</button>
            </form>`
    }
}
