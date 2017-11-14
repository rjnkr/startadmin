Ext.win = function(){
    var msgCt;
	var storeLoading = new Array();
	var loadMask;
	var saveMask;
	var loginMask;

	// helper functie voor msg. De text t wordt getoond
    function createBox(t)
	{
       return '<div class="msg">' + t + '</div>';
    }
	
	// Laat een balk boven in het scherm zien met de tekat (variable t). De tekst verdwijnt na 1.5 seconde
    return {
        msg : function(t)
		{
            if(!msgCt)
				msgCt = Ext.DomHelper.insertAfter(document.all.Header, {id:'msg-div'}, true);
			else
				msgCt = Ext.DomHelper.overwrite("msg-div", {id:'msg-div'}, true);

			var m = Ext.DomHelper.append(msgCt, createBox(t), true);
            m.hide();
            m.slideIn('t', 
			{
				//easing: 'easeOut',
				//remove: true,
				duration: 1500
			});
        },
		
        init : function()
		{
        },
		
		// Laat de gebruiker een melding zien dat data opgehaald wordt load=true. Er kunnen meerder sessie tegelijk data ophalen 
		// Iedere sessie wordt bijgehouden in het array "storeLoading". Wanneer een sessie klaar is wordt de functie nogmaals aangeroepen
		// maar nu load=false. Als alle sessies klaar zijn, wordt het window verwijderd
		showLoading : function (load, identifier)
		{
			if (!loadMask)
				loadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Ophalen data, even wachten..."});
			
			if (load)
			{
				storeLoading.push(identifier);
			}
			else
			{
				i = storeLoading.indexOf(identifier);
				if (i >= 0)
				{
					storeLoading.splice(i, 1);
				}
			}
			
			if (storeLoading.length > 0)
				loadMask.show();				
			else
				loadMask.hide();				
		},
		
		// Laat de gebruiker zijn dat we data aan het opslaan zijn
		showSaving: function (tonen)
		{
			if (!saveMask)
				saveMask = new Ext.LoadMask(Ext.getBody(), {msg:"Verwerken data, even wachten..."});
			
			if (tonen)
				saveMask.show();				
			else
				saveMask.hide();				
		},
		
		// Toon gebruiker dat er nu ingelogd wordt
		showLogin: function (tonen)
		{
			if (!loginMask)
				loginMask = new Ext.LoadMask(Ext.getBody(), {msg:"Aanmelden, even wachten..."});
			
			if (tonen)
				loginMask.show();				
			else
				loginMask.hide();				
		}
    }
}();

// Toon de avatar. En pas de windowsize aan op basis van de foto
function ToonAvatar(url)
{
	var view = Ext.widget('AvatarWindow', {'src': url});
	view.show();
	setTimeout(AvatarWindowResize,100);	//  roep de functie over 100 milli seconde aan
}

function AvatarWindowResize()
{
	var img = Ext.getCmp('AvatarImg');
	if (img != null)
	{
		console.log(img.imgEl.dom.naturalHeight);
		console.log(img.imgEl.dom.naturalWidth);
		
		// als de foto geladen is, kunnen de hoogte en breedte bepalen. Anders proberen we het gewoon nog een keer
		if ((img.imgEl.dom.naturalHeight > 0) && (img.imgEl.dom.naturalWidth > 0))
			Ext.getCmp('AvatarWindow').setSize(img.imgEl.dom.naturalWidth,img.imgEl.dom.naturalWidth);
		else	
			setTimeout(AvatarWindowResize,1 * 100);	//  roep de functie iedere 100 milli seconde aan
	}
}


// MICROSOFT Ondersteund niet alle javascript functie :-( :-( ^5#@$#*&&^
// Dus maar zelf implenteren

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}





