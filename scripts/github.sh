# github has archives of JSON respository stuff.
# process would be to download an archive, split and load as json
# template is date and hour
curl http://data.githubarchive.org/2012-04-11-15.json.gz | gunzip - | perl -pe's/\{("repository"|"actor_attributes"|"created_at")/\r\n\{\1/g' | split -l1 
