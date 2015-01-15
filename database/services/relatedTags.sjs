/*
 * relatedTags.sjs
 *
 * Server-side extension for incorporating 
 * results from a SPARQL query into
 * a values call
 */
var sem = require("/MarkLogic/semantics.xqy");

function get(context, params) {
    xdmp.log("RELATED TAGS");
    var tag = params.tag;  // required
    var structuredQuery = params.structuredQuery;  // required
    xdmp.log(tag);
    var queryResults = sem.sparql(
        'prefix dbr: <http://dbpedia.org/resource/>              '+
        'prefix dbc: <http://dbpedia.org/resource/Category:>     '+
        'prefix dc: <http://purl.org/dc/terms/>                  '+
        'prefix dbo: <http://dbpedia.org/ontology/>              '+
        'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>    '+
                                                                ''+
        'select distinct (lcase(?label2) as ?relatedTag)         '+
        'where                                                   '+
        '{                                                       '+
           '?r rdfs:label ?label ;                               '+
               'dc:subject ?sub .                                '+
           '?r2 dc:subject ?sub ;                                '+
               'rdfs:label ?label2 .                             '+
           'filter (?r != ?r2)                                   '+
           'filter (lcase(?label) = $tag)                        '+
        '}                                                       '+
        'order by ?label2 limit 5000', {tag: tag});
    var queryStrings = [];
    for (var result of queryResults) {
        queryStrings.push(result.relatedTag);
    };
    var queryString = "tag:" + queryStrings.join(" OR tag:");
    context.outputTypes = ["application/json"];
    return {qtext:queryString};
};

exports.GET = get;
