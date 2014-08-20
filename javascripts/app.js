var width = 1200,
    height = 600,
    parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse,
    formatDate = d3.time.format("%d %b %Y"),
    x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([0, height]),
    xAxis = d3.svg.axis()
            .scale(x)
            .tickFormat(d3.time.format("%d %b %Y"))
            .ticks(d3.time.months)
            .orient("bottom"),
    yAxis = d3.svg.axis()
                .scale(y)
                .orient("left"),
    svg = d3.select("body")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                    .append("g")
                        .attr("transform", "translate(" + 0 + "," + 20 + ")")
    ;

function displayRepos(data, type) {
    var nodes = svg.selectAll('g.' + type)
                    .data(data, function(d) { return d.name } );

    var nodesEnter = nodes.enter().append("g")
                        .attr('class', type)
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        })

    nodesEnter.append("svg:circle")
                    .attr("r", 2)
    ;


    nodesEnter.append("svg:text")
            .attr('class', 'text-bg')
            .attr("dy", 25)
            .attr("text-anchor", function(d) { return d['text-anchor'] || 'middle' })
            .text(function(d) { return d.name });

    nodesEnter.append("svg:text")
        .attr("dy", 25)
        .attr("text-anchor", function(d) { return d['text-anchor'] || 'middle' })
        .text(function(d) { return d.name });


    nodesEnter.append("svg:text")
            .attr('class', 'text-bg')
            .attr("dy", 45)
            .attr("text-anchor", 'middle')
            .text(function(d) { return d.friendly });

    nodesEnter.append("svg:text")
        .attr("dy", 45)
        .attr("text-anchor", 'middle')
        .text(function(d) { return d.friendly });

    return nodes;
}

function displayRepoData(data, type) {
    var nodes = svg.selectAll('g.' + type)
                    .data(data, function(d) { return d.created_at } )

    var nodesEnter = nodes.enter().append("g")
                        .attr('class', type)
                        .attr("transform", function(d,i) {
                            return "translate("+ (width/2) +","+ height +")";
                        })

    nodesEnter.append("svg:circle")
                    .attr("r", 2)
    ;

    // Transition nodes to their new position.
    nodes.transition()
        .duration(1000)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });


    return nodes;
}



var url = '/assets/media/follow.csv';


var parseDateISO = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse,
    dayFormat = d3.time.format('%j'),
    yearFormat = d3.time.format('%Y'),
    friendlyFormat = d3.time.format('%b %Y'),

    yearSet = ['2009', '2010', '2011', '2012', '2013', '2014'],
    daysInYear = 365,

    todaysDay = dayFormat(new Date()),
    todaysYear = yearFormat(new Date()),

    d3Date = d3.select('#date')
    ;

// Play the visualization by looping through all days for all years in yearSet.
function play(callback) {
    var total = daysInYear*yearSet.length,
        day = 0,
        counter = 0,
        yearCounter = 0
    ;
    var intID = setInterval(function() {

        var yearString = yearSet[yearCounter],
            counterString = (counter.length === 1) ? '00' + counter : counter.toString()
        ;

        callback(counterString);
        d3Date.text(day + ' ' + yearString);

        counter++;
        day++;
        if(counter%daysInYear === 0) {
            yearCounter++;
            day=0;
        }

        if(counter >= total || (parseInt(yearString) >= todaysYear && day >= todaysDay)) {
            console.log('clear!')
            clearInterval(intID);
        }
    }, 1);
}

function parseBigTableDataToDict(data, _repos) {
    var dict = {};
    data.forEach(function(d,i) {
        d.date = parseDate(d.created_at);
        d.day = dayFormat(d.date);
        d.year = yearFormat(d.date);
        d.friendly = friendlyFormat(d.date);

        if(_repos[d.repository_name]) {
            d.x = _repos[d.repository_name].x;
            d.y = _repos[d.repository_name].y;

            var derp = yearSet.indexOf(d.year.toString());
            derp = parseInt(derp);
            var day = parseInt(d.day) + (derp*daysInYear);

            if(dict[day.toString()]) {
                dict[day.toString()].push(d);
            }
            else {
                dict[day.toString()] = [d];
            }
        }
    });

    return dict;
}


function parseRepos(data) {
    var dict = {};
    var repos = {};

    data.forEach(function(d) {
        d.date = parseDateISO(d.created_at);
    });
    data = data.sort(function(a, b){ return (a.date > b.date) ? +1 : -1 ; });
    data.forEach(function(d, i) {
        d.day = dayFormat(d.date);
        d.year = yearFormat(d.date);
        d.friendly = friendlyFormat(d.date);
        d.x = (150*(i%10));
        d.y = (150*(Math.floor(i/10)));

        var derp = yearSet.indexOf(d.year.toString());
        derp = parseInt(derp);
        var day = parseInt(d.day) + (derp*daysInYear);

        if(dict[day.toString()]) {
            dict[day.toString()].push(d);
        }
        else {
            dict[day.toString()] = [d];
        }

        repos[d.name] = d;
    });

    return [dict, repos];
}



d3.json('https://api.github.com/users/plusjade/repos', function(data) {
    var blah = parseRepos(data),
        repoDict = blah[0],
        repos = blah[1]
    ;

    d3.csv('/assets/media/watch.csv', function(data) {
        var watchDict = parseBigTableDataToDict(data, repos);

        d3.csv('/assets/media/fork.csv', function(forkData) {
            var forkDict = parseBigTableDataToDict(data, repos);



            play(function(counterString) {
                if(repoDict[counterString]) {
                    displayRepos(repoDict[counterString], 'repos');
                }

                if(watchDict[counterString]) {
                    displayRepoData(watchDict[counterString], 'watch');
                }

                if(forkDict[counterString]) {
                    displayRepoData(forkDict[counterString], 'fork');
                }

            })



        })



    })

})


