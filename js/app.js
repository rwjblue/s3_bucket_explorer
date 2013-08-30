App = Ember.Application.create();

App.ApplicationRoute = Ember.Route.extend({
  model: function(){
    return {bucketName: 'builds.emberjs.com',
            prefix: 'latest/'};
  }
});

App.S3BucketExplorerComponent = Ember.Component.extend({
  useSSL: true,
  endpoint: 's3.amazonaws.com',
  response: null,

  /**
   * URL Building Properties
   */
  protocol: function(){
    if (this.get('useSSL'))
      return 'https://';
    else
      return 'http://';
  }.property('useSSL'),

  hostname: function(){
    var bucket = this.get('bucket'),
        endpoint = this.get('endpoint');

    if (!bucket)
      return endpoint;
    else
      return bucket + '.' + endpoint;
  }.property('bucket','endpoint'),

  delimiterParameter: function(){
    return 'delimiter=' + this.getWithDefault('delimiter','').toString();
  }.property('delimiter'),

  markerParameter: function(){
    return 'marker=' + this.getWithDefault('marker','').toString();
  }.property('marker'),

  maxKeysParameter: function(){
    return 'max-keys=' + this.getWithDefault('maxKeys','').toString();
  }.property('maxKeys'),

  prefixParameter: function(){
    return 'prefix=' + this.getWithDefault('prefix','').toString();
  }.property('prefix'),

  url: function(){
    return this.get('protocol') + 
                        this.get('hostname')            + '?' +
                        this.get('delimiterParameter')  + '&' +
                        this.get('markerParameter')     + '&' +
                        this.get('maxKeysParameter')    + '&' +
                        this.get('prefixParameter');
  }.property('protocol','hostname','delimiterParameter','markerParameter','maxKeysParameter','prefixParameter'),

  /**
   * Response Processing
   */
  load: function(){
    var self = this;

    Ember.$.get(this.get('url'), function(data){
      self.set('response', data);

      var contents = data.getElementsByTagName('Contents'),
      length   = contents.length,
      files    = [];

      for(var i = 0; i < length; i++){
        files.push({
          size: contents[i].getElementsByTagName('Size')[0].firstChild.data,
          name: contents[i].getElementsByTagName('Key')[0].firstChild.data,
          lastModified: contents[i].getElementsByTagName('LastModified')[0].firstChild.data,
        });
      }
      self.set('files', files);
    });
  }.observes('url').on('init')
});
