/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
