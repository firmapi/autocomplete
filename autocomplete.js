$(function() {

  // --------------------------------------------------------------------------
  // Utilisation de la clé API stockée dans les cookies si celle-ciest présente
  // --------------------------------------------------------------------------

  $('input[name="api_key"').val(Cookies.get('firmapi_api_key'));

  // --------------------------------------------------------------------------
  // Typeahead
  // --------------------------------------------------------------------------

  var companies = new Bloodhound({
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: remote_url(),
      filter: function(data) {
        retval = [];
        for (var i = 0; i < data.result.list.length; i++) {
          retval.push({
            name: data.result.list[i].name,
            postal_code: data.result.list[i].postal_code,
            siren: data.result.list[i].siren
          });
        }

        return retval;
      }
    }
  });

  companies.initialize();

  $('#typeahead').typeahead(null, {
    name: 'company',
    displayKey: 'name',
    source: companies.ttAdapter(),
    templates: {
      suggestion: Handlebars.compile('<p><strong>{{name}}</strong><br><small><span><span class="text-muted">Code postal : </span>{{postal_code}}</span><span class="pull-right"><span class="text-muted">SIREN  : </span>{{siren}}</span></small></p>')
    }
  }).bind('typeahead:selected', function(obj, datum, name) {
    complete_company(datum.siren);
  });

  // MAJ de la clé API dès quelle est insérée par l'utilisateur.
  $('input[name="api_key"').change(function() {
    companies.remote.url = remote_url();

    // Enregistrement dans les cookies de la clé API de Firmapi pour une durée
    // d'une heure
    Cookies.set('firmapi_api_key', $('input[name="api_key"').val(), { expires: 3600 });
  });
});

remote_url = function() {
  api_key = $('input[name="api_key"').val();
  return 'https://firmapi.com/api/v1/companies?search=%QUERY&size=5&api_key=' + api_key;
};


// --------------------------------------------------------------------------
// Remplissage des informations de l'entreprise sélectionnée
// --------------------------------------------------------------------------

complete_company = function(siren) {
  $.ajax({
    url: 'https://firmapi.com/api/v1/company?siren=' + siren + '&api_key=' + $('input[name="api_key"').val()
  })
  .done(function(data) {
    company = data.result;
    $('#name').html(company.name);
    $('#postal_code').html(company.postal_code);
    $('#city').html(company.city);
    $('#naf_code').html(company.naf_code);
    $('#vat_number').html(company.vat_number);
    $('#website').html(company.website);
    $('#registration_date').html(company.registration_date);
    $('#address').html(company.address);
    $('#location').html('Latitude : ' + company.location.latitude + ', longitude : ' + company.location.longitude);
    $('#google_maps').attr('src', '');

    full_address = company.address + ', ' + company.postal_code + ', ' + company.city + ', France';
    $('#google_maps').attr('src', 'http://maps.googleapis.com/maps/api/staticmap?center=' + full_address + '&zoom=13&size=600x300&maptype=roadmap&markers=' + full_address);

  });
};

