/*
app/appRouting.js
 */

define(['app/module'], function (module) {

  module.value('stubData', {
/*jshint ignore:start */
    'results': [
      {
        'title': 'Why do birds suddenly appear every time you are near? I\'m running MarkLogic 7.0 with geospatial and semantics enabled on Fedora 99 under an IKEA Borgsjo office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'joeUser@marklogic.com',
          'displayName': 'Joe',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 999
        },
        'tags': ['birds', 'robins', 'vultures'],
        'creationDate': '2014-06-09T15:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/1.json'
      },
      {
        'title': 'Why do avians suddenly appear every time you are near? I\'m running MarkLogic 6.0 with beverages enabled on Ubuntu 60 under a Macy\'s Doss office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'maryUser@marklogic.com',
          'displayName': 'Mary',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 123
        },
        'tags': ['birds', 'robins'],
        'creationDate': '2014-05-23T15:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/2.json'
      },
      {
        'title': 'Why do flying creatures suddenly appear every time you are near? I\'m running MarkLogic 8.0 with horchata enabled on Atari 2600 under a Montgomery Ward UrgeForest office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'successUser@marklogic.com',
          'displayName': 'Pat',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 7
        },
        'tags': ['birds', 'flying-creatures', 'vultures', 'love', 'semantics'],
        'creationDate': '2013-04-11T18:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/3.json'
      },
      {
        'title': 'Why do birds suddenly appear every time you are near? I\'m running MarkLogic 7.0 with geospatial and semantics enabled on Fedora 99 under an IKEA Borgsjo office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'joeUser@marklogic.com',
          'displayName': 'Joe',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 999
        },
        'tags': ['birds', 'robins', 'vultures'],
        'creationDate': '2014-06-09T15:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/1.json'
      },
      {
        'title': 'Why do avians suddenly appear every time you are near? I\'m running MarkLogic 6.0 with beverages enabled on Ubuntu 60 under a Macy\'s Doss office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'maryUser@marklogic.com',
          'displayName': 'Mary',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 123
        },
        'tags': ['birds', 'robins'],
        'creationDate': '2014-05-23T15:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/2.json'
      },
      {
        'title': 'Why do flying creatures suddenly appear every time you are near? I\'m running MarkLogic 8.0 with horchata enabled on Atari 2600 under a Montgomery Ward UrgeForest office desk.',
        'body': 'Tonx pour-over, readymade Pitchfork slow-carb Portland brunch Schlitz gastropub artisan. Trust fund Echo Park wayfarers Godard ethnic leggings kale chips Shoreditch Bushwick, post-ironic forage blog beard meh. Fap narwhal farm-to-table, wolf XOXO seitan four loko. Dreamcatcher banh mi try-hard Tumblr literally. Swag literally Kickstarter selfies.',
        'owner': {
          'userName': 'successUser@marklogic.com',
          'displayName': 'Pat',
          'id': 'cf99542d-f024-4478-a6dc-7e723a51b040',
          'reputation': 7
        },
        'tags': ['birds', 'flying-creatures', 'vultures', 'love', 'semantics'],
        'creationDate': '2013-04-11T18:37:14.773514-07:00',
        'answers': [],
        'comments': [],
        'id': '/qna/3.json'
      }
    ],
    'facets':  [
      {
        'name': 'tags',
        'items': [
          {
            'name': 'birds',
            'count': 6
          },
          {
            'name': 'robins',
            'count': 4
          },
          {
            'name': 'vultures',
            'count': 4
          }
        ]
      }
    ]
/*jshint ignore:end */


  });
});
