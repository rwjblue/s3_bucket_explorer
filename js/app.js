App = Ember.Application.create();

App.ApplicationRoute = Ember.Route.extend({
  model: function(){
    return {bucketName: 'builds.emberjs.com',
            current: [
              {title: 'Latest Development Builds', prefix: 'latest/', delimiter: '/'},
              {title: 'Latest Stable Builds', prefix: 'stable/', delimiter: '/'}
            ]};
  }
});

App.S3BucketExplorerComponent = Ember.Component.extend({
  useSSL: true,
  endpoint: 's3.amazonaws.com',
  response: null,

  /**
   * URL Building
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

  baseUrl: function(){
    return this.get('protocol') + this.get('hostname');
  }.property('protocol', 'hostname'),

  queryParams: function(){
    return this.get('delimiterParameter')  + '&' +
           this.get('markerParameter')     + '&' +
           this.get('maxKeysParameter')    + '&' +
           this.get('prefixParameter');
  }.property('delimiterParameter','markerParameter','maxKeysParameter','prefixParameter'),

  queryUrl: function(){
      return this.get('baseUrl') + '?' + this.get('queryParams');
  }.property('baseUrl','queryParams'),

  fileURL: function(relativePath){
    return this.get('baseUrl') + '/' + relativePath;
  },

  formatSize: function(bytes) {
  },

  /**
   * Response Processing
   */
  load: function(){
    var self = this;

    Ember.$.get(this.get('queryUrl'), function(data){
      self.set('response', data);

      var contents = data.getElementsByTagName('Contents'),
      length   = contents.length,
      files    = [];

      for(var i = 0; i < length; i++){
        var size = contents[i].getElementsByTagName('Size')[0].firstChild.data,
            name = contents[i].getElementsByTagName('Key')[0].firstChild.data,
            lastModified = new Date(contents[i].getElementsByTagName('LastModified')[0].firstChild.data);

        files.push({name: name,
                    size: size,
                    lastModified: lastModified,
                    url: self.fileURL(name)});
      }
      self.set('files', files);
    });
  }.observes('queryUrl').on('init')
});

Ember.Handlebars.helper('format-bytes', function(bytes){
  return (bytes / 1024).toFixed(2) + ' KB';
});

Ember.Handlebars.helper('format-date-time', function(d) {
  function pad(n){return n<10 ? '0'+n : n; }

  return d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth()+1)  + '-' +
    pad(d.getUTCDate())     + ' ' +
    pad(d.getUTCHours())    + ':' +
    pad(d.getUTCMinutes())  + ':' +
    pad(d.getUTCSeconds());
});
