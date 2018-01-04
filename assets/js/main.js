/***********************************************
                    MAIN LOGIC
************************************************/

var params = getUrlParams(),
    anchors = getUrlAnchors(),
    links, experts;

$.getJSON("./assets/data/awesome-links.json", function(data){
    links = data;

    $.getJSON("./assets/data/experts.json", function(data){
        var template = $.templates("#expertCard");
        experts = shuffle(data);
        var htmlOutput = template.render(experts);

        $("#expert-list").html(htmlOutput);

        // Add missing expert
        var template = $.templates("#missingExpert");
        var htmlOutput = template.render({});
        $("#expert-list").append(htmlOutput);


        var techs = [];
        for ( i=0; i<data.length; i++ ){
            var aux = data[i].technologies;
            if(aux){
                aux = aux.split(", ");
                techs = techs.concat(aux);
            }
        }

        techs = unique(techs);
        var techsTmpl = $.templates("#techsTmpl");
        var htmlOutput = techsTmpl.render(techs.sort());

        $("#all-techs").html(htmlOutput);
        $("#all-techs").append('<li>Missing any?, please <a href="https://github.com/esri-es/arcgis-experts/issues/new?title=Missing topic: [TOPIC]&body=I would like to see experts in...">let us know</a></li>')

        $( "#tags" ).autocomplete({source: techs});

        $('.clickable').click(function(){
            $('#tags').val(this.innerText);
            $('#tags').keyup();
        });

        $('[data-modal="modalProfile"] button.js-modal-toggle').click(function(){
            window.location.href = window.location.href.replace(/#*expert=.*/i, '#');
        })

        // Open and load data inside the modal with the user profile info
        $('.showModalProfile').click(function(e){
            //e.preventDefault();
            var userslug = $(this).data("userslug"),
                userindex = $(this).data("userindex")

            if(window.location.href.indexOf('expert=') !== -1 ){
                window.location.href = window.location.href.replace(/#*expert=.*/i, `#expert=${userslug}`);
            }else{
                if(window.location.href.indexOf('#') !== -1 ){
                    window.location.href += `expert=${userslug}`;
                }else{
                    window.location.href += `#expert=${userslug}`;
                }
            }

            var modal = $('.js-modal[data-modal="modalProfile"]');
            var e = experts[userindex];
            var elClass = `#${userslug} .social`;
            var elFigure = `#${userslug} figure`;

            modal.addClass('is-active');

            $('#expertName').text(`${e.name}\'s profile`);
            $('#expertSkills').html(`<strong>Background in:</strong><br> ${e.technologies}`);
            $('#expertSocialLinks').empty().append($(elClass).clone())

            var profile = encodeURIComponent(JSON.stringify(e));
            $('#expertDisclaimer').html(`Have you found something wrong or do you miss something?, <a href="https://github.com/esri-es/arcgis-experts/issues/new?title=Update ${e.name} profile&body=${profile}">please tell us</a>.`);

            if(e.picture){
                $('.expertPicture').html($(elFigure).clone());
            }

            return false;
        });

        if(params && params.topic){
            $('#tags').val(params.topic);
            $('#tags').keyup();
        }

        if(anchors && anchors.expert){
            openExpertModal(anchors.expert);
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) { alert('getJSON request failed! ' + textStatus); })
});
$('#clearBtn').click(function(){
    $('#tags').val('');
    $('#tags').keyup();
    $('#clearBtn').addClass('btn-disabled');
})

$("#tags").keyup(function(){

    var value = this.value.toLowerCase();
    if(value){
        $('#clearBtn').removeClass('btn-disabled');
        var condition = `[data-background*=\"${value}\"]`;
        $(`.card.block${condition}`).show()
        $(".card.block").not(condition).hide()
    }else{
        $(".card.block").show();
        $('#clearBtn').addClass('btn-disabled');
    }
    $("#missingExpertLink").attr('href', `https://github.com/esri-es/arcgis-experts/issues/new?title=Missing%20expert%20in%20${this.value}`)
    $("[data-background=\"missing\"]").show();

    if(this.value){
        // Avoid display all techs
        var regex = new RegExp(this.value, "i");
        var filteredNames = filtered_keys(links, regex);
        var hasAwesomePage = false;

        if(filteredNames.length > 0){
            console.log("filteredNames=",filteredNames)
            $(".selected-techs").empty();
            filteredNames.forEach(function(elem, i){

                if(links[elem].url){
                    hasAwesomePage = true;
                    var el = $('<a target="_blank"></a>').text(elem).attr("href", links[elem].url);
                    $(".selected-techs").append(el);

                    if(i < filteredNames.length - 1){

                        $(".selected-techs").append(", ");
                    }
                }

            });
            if (hasAwesomePage){
                $(".alert").show();
            }

        }
    }else{
        $(".alert").hide();
    }
});

function openExpertModal(expertName){
    $(`#${expertName} .js-modal-toggle`).click();
    // debugger
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var filtered_keys = function(obj, filter) {
  var key, keys = [];
  for (key in obj) {
    if (obj.hasOwnProperty(key) && filter.test(key)) {
      keys.push(key);
    }
  }
  return keys;
}

function getUrlParams() {
    var search = location.search.substring(1);
    if(search){
        var obj = decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"');
        return JSON.parse('{"' + obj  + '"}');
    }else{
        return null;
    }
}
function getUrlAnchors() {
    var search = location.href.split("#")[1];
    if(search){
        var obj = decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"');
        return JSON.parse('{"' + obj  + '"}');
    }else{
        return null;
    }
}
/***********************************************
    JSRENDER converters for template rendering
************************************************/
$.views.converters("lower", function(val) {
    // Convert data-value or expression to upper case
    if(val){
        return val.toLowerCase();
    }else{
        return '';
    }
});

$.views.converters("firstname", function(val) {
    return val.split(' ')[0];
});

$.views.converters("lastname", function(val) {
    return val.split(' ')[1];
});

$.views.converters("slugify", function(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
});

// Remove duplicates from array
function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}
