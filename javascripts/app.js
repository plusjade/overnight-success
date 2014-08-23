var App = {},
    width = 1200,
    height = 600,
    parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse,
    formatDate = d3.time.format("%d %b %Y"),
    formatDateHTML = d3.time.format("<span>%d</span> <span>%b</span> <span>%Y</span>"),
    svg = d3.select("body")
            .append("svg")
                .attr('viewBox', '0 0 1200 600')
                .append("g")
    ;

function displayRepos(data, type) {
    var nodes = svg.selectAll('g.' + type)
                    .data(data, function(d) { return d.name } );

    var nodesEnter = nodes.enter().append("g")
                        .attr('class', type)
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        })
    // Pulse highlight
    nodesEnter
        .append('svg:circle')
            .attr('r', 0)
            .attr('fill', '#2baf2b')
            .attr('opacity', 0.2)
            .transition()
                .duration(1200)
                .attr('r', 120)
                .attr('opacity', 0)
                .remove()
    ;
    nodesEnter
        .append('use')
            .attr('xlink:href', '#repo')
            .attr('class', type)
            .attr('x', -15)
            .attr('y', -15)
            .attr('height', 0)
            .attr('width', 0)
            .transition()
                .duration(400)
                .attr('x', -20)
                .attr('y', -20)
                .attr('height', 40)
                .attr('width', 40)
            .transition()
                .duration(400)
                .attr('x', -15)
                .attr('y', -15)
                .attr('height', 30)
                .attr('width', 30)
    ;

    var stats = nodesEnter.append('g')
                    .attr('class', 'data')
                    .attr('opacity', 0)
    ;
    stats
        .append('use')
            .attr('xlink:href', '#watch')
            .attr('x', 25)
            .attr('y', -15)
            .attr('height', 12)
            .attr('width', 12)
            .attr('fill', '#455a64')
    ;
    stats
        .append('use')
            .attr('xlink:href', '#fork')
            .attr('x', 55)
            .attr('y', -15)
            .attr('height', 12)
            .attr('width', 12)
            .attr('fill', '#455a64')
    ;
    stats
        .append('text')
            .text('0')
            .attr('x', 25)
            .attr('y', 13)
    ;
    stats
        .append('text')
            .text('0')
            .attr('x', 55)
            .attr('y', 13)
    ;
    stats.append("svg:text")
            .attr('class', 'text-bg')
            .attr("dy", 35)
            .attr("text-anchor", 'middle')
            .text(function(d) { return d.name })
    ;
    stats.append("svg:text")
        .attr("dy", 35)
        .attr("text-anchor", 'middle')
        .text(function(d) { return d.name })
    ;
    stats.append("svg:text")
            .attr('class', 'text-bg')
            .attr("dy", 50)
            .attr("text-anchor", 'middle')
            .text(function(d) { return d.friendly });
    stats.append("svg:text")
        .attr("dy", 50)
        .attr("text-anchor", 'middle')
        .text(function(d) { return d.friendly })
    ;
    stats
        .transition()
            .delay(400)
            .duration(800)
            .attr('opacity', 1)

    return nodes;
}

function displayRepoData(data, type) {
    var nodes = svg.selectAll('g.' + type)
                    .data(data, function(d) { return d.created_at } )

    var nodesEnter = nodes.enter().append("g")
                        .attr('class', type)
                        .attr("transform", function(d) {
                            return "translate(" + d.target.x + "," + d.target.y + ")";
                        })
                        .attr('opacity', 1)

    nodesEnter.append('use')
        .attr('xlink:href', '#' + type)
        .attr('class', type)
        .attr('height', 10)
        .attr('width', 10)
        .transition()
            .duration(100)
            .attr('height', 20)
            .attr('width', 20)


    nodes
        .transition()
            .duration(800)
            .attr("transform", function(d) {
                return "translate(" + d.target.x + "," + 0 + ")";
            })
            .attr('opacity', 0)
            .each('end', function(d) {
                d3.select(this).remove();
            })

    return nodes;
}



var parseDateISO = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse,
    parseDayofYear = d3.time.format("%j-%Y").parse,
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
        d3Date.html(formatDateHTML(parseDayofYear(day + '-' + yearString)));

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

function parseBigTableDataToDict(data, target, type) {
    var dict = {};
    data.forEach(function(d) {
        d.date = parseDate(d.created_at);
        d.day = dayFormat(d.date);
        d.year = yearFormat(d.date);
        d.friendly = friendlyFormat(d.date);
        d.type = type;
        d.target = target(d);

        var derp = yearSet.indexOf(d.year.toString());
        derp = parseInt(derp);
        var day = parseInt(d.day) + (derp*daysInYear);

        if(dict[day.toString()]) {
            dict[day.toString()].push(d);
        }
        else {
            dict[day.toString()] = [d];
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
        d.x = (175*(i%8)) + 50;
        d.y = (120*(Math.floor(i/8))) + 100;

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


function displayOwner(owner) {
    var html = '<img src="//www.gravatar.com/avatar/'+ owner.gravatar_id +'">';
    d3.select('body')
        .append('div')
            .attr('id', 'owner')
            .html(html);

    App.follow = svg.append('g').attr('class', 'owner-wrap')
                                .attr("transform", "translate(700,50)")

    App.follow
        .append('g')
            .attr("transform", "translate(-18,-20)")
        .append('use')
            .attr('xlink:href', '#follow')
            .attr('class', 'follow')
            .attr('height', 40)
            .attr('width', 40)
}

d3.json('https://api.github.com/users/plusjade/repos', function(data) {
    var blah = parseRepos(data),
        repoDict = blah[0]
    ;
    displayOwner(data[0].owner);
    App.owner = data[0].owner;
    App.repos = blah[1];


    d3.csv('/assets/media/watch.csv', function(watchData) {
        var watchDict = parseBigTableDataToDict(watchData, function(d) {
            var target = { x: 0, y: 0 };
            if (App.repos[d.repository_name]) {
                target.x = App.repos[d.repository_name].x + 25;
                target.y = App.repos[d.repository_name].y - 15;
            }
            return target;
        }, 'watch');

        d3.csv('/assets/media/fork.csv', function(forkData) {
            var forkDict = parseBigTableDataToDict(forkData, function(d) {
                var target = { x: 0, y: 0 };
                if (App.repos[d.repository_name]) {
                    target.x = App.repos[d.repository_name].x + 55;
                    target.y = App.repos[d.repository_name].y - 15;
                }
                return target;
            }, 'fork');

            d3.csv('/assets/media/follow.csv', function(data) {
                var followDict = parseBigTableDataToDict(data, function(d) { return { x: 720, y: 0 } }, 'follow');

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

                    if(followDict[counterString]) {
                        displayRepoData(followDict[counterString], 'follow');
                    }

                })

            });


        })



    })

})


