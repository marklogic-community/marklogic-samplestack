// extension to set permissions on a graph.

function setPerms(context, params, body) {
    var sem = require('/MarkLogic/semantics'); 
    var graphName = body.toObject().graphName;
    sem.graphSetPermissions(sem.iri(graphName),
         [xdmp.permission("samplestack-guest", "read"),
         xdmp.permission("samplestack-writer", "update"),
         ]);
}
exports.PUT = setPerms;
