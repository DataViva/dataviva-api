# -*- coding: utf-8 -*-
from flask import g
from dataviva import db, __latest_year__
from dataviva.utils.auto_serialize import AutoSerialize
from dataviva.utils.title_case import title_case
from dataviva.attrs.models import Bra, Isic, Hs, Cbo, Wld

import ast, re

build_ui = db.Table('apps_build_ui',
         db.Column('build_id', db.Integer,db.ForeignKey('apps_build.id')),
         db.Column('ui_id', db.Integer,db.ForeignKey('apps_ui.id'))
)

class App(db.Model, AutoSerialize):

    __tablename__ = 'apps_app'
    
    id = db.Column(db.Integer, primary_key = True)
    type = db.Column(db.String(20))
    name_en = db.Column(db.String(20))
    name_pt = db.Column(db.String(20))
    viz_whiz = db.Column(db.String(20))
    color = db.Column(db.String(7))
    
    def name(self):
        lang = getattr(g, "locale", "en")
        return getattr(self,"name_"+lang)
    
    def serialize(self, **kwargs):
        auto_serialized = super(App, self).serialize()
        del auto_serialized["name_en"]
        del auto_serialized["name_pt"]
        auto_serialized["name"] = self.name()
        return auto_serialized

class Build(db.Model, AutoSerialize):

    __tablename__ = 'apps_build'
    
    id = db.Column(db.Integer, primary_key = True)
    dataset = db.Column(db.String(20))
    bra = db.Column(db.String(20))
    filter1 = db.Column(db.String(20))
    filter2 = db.Column(db.String(20))
    output = db.Column(db.String(20))
    title_en = db.Column(db.String(120))
    title_pt = db.Column(db.String(120))
    app_id = db.Column(db.Integer, db.ForeignKey(App.id))
    
    ui = db.relationship('UI', secondary=build_ui, 
            backref=db.backref('Builds'), lazy='dynamic')
    app = db.relationship('App',
            backref=db.backref('Builds', lazy='dynamic'))
    
    def get_ui(self, ui_type):
        return self.ui.filter(UI.type == ui_type).first()

    def set_bra(self, bra_id):
        '''If build requires 2 bras and only 1 is given, supply a 2nd'''
        if isinstance(self.bra, list):
            return
        
        if bra_id == 'bra':
            bra_id = 'all'
            
        if "_" in self.bra and "_" not in bra_id:
            if bra_id == "rj":
                bra_id = bra_id + "_mg"
            else:
                bra_id = bra_id + "_rj"
        elif "_" not in self.bra and "_" in bra_id:
            bra_id = bra_id.split("_")[0]
        self.bra = []
        
        for i, b in enumerate(bra_id.split("_")):
            if b == "all":
                self.bra.append(Wld.query.get("sabra"))
                self.bra[i].id = "all"
            else:
                if "." in b:
                    split = b.split(".")
                    b = split[0]
                    dist = split[1]
                else:
                    dist = 0
                state = b[:2]
                if self.output == "bra" and len(b) == 8 and dist == 0:
                    b = state
                    dist = 0
                self.bra.append(Bra.query.get(b))
                self.bra[i].distance = dist
                self.bra[i].neighbor_ids = [b.bra_id_dest for b in self.bra[i].get_neighbors(dist)]
                # raise Exception([b.id for b in self.bra[i].pr.all()])
                self.bra[i].pr_ids = [b.id for b in self.bra[i].pr.all()]

    def set_filter1(self, filter):
        if self.filter1 != "all":
            if self.dataset == "rais":
                self.isic = []
                for i, f in enumerate(filter.split("_")):
                    if Isic.query.get(f):
                        self.isic.append(Isic.query.get(f))
                    else:
                        self.isic.append(Isic.query.get('r9000'))
                self.filter1 = "_".join([i.id for i in set(self.isic)])
            elif self.dataset == "secex":
                self.hs = []
                for i, f in enumerate(filter.split("_")):
                    if Hs.query.get(f):
                        self.hs.append(Hs.query.get(f))
                    else:
                        self.hs.append(Hs.query.get('178703'))
                self.filter1 = "_".join([h.id for h in set(self.hs)])
    
    def set_filter2(self, filter):
        if self.filter2 != "all":
            if self.dataset == "rais":
                self.cbo = []
                for i, f in enumerate(filter.split("_")):
                    if Cbo.query.get(f):
                        self.cbo.append(Cbo.query.get(f))
                    else:
                        self.cbo.append(Cbo.query.get('2211'))
                self.filter2 = "_".join([c.id for c in set(self.cbo)])
            elif self.dataset == "secex":
                self.wld = []
                for i, f in enumerate(filter.split("_")):
                    if Wld.query.get(f):
                        self.wld.append(Wld.query.get(f))
                    else:
                        self.wld.append(Wld.query.get('aschn'))
                self.filter2 = "_".join([w.id for w in set(self.wld)])
        
    '''Returns the URL for the specific build.'''
    def url(self, **kwargs):

        if isinstance(self.bra,(list,tuple)):
            bras = []
            for b in self.bra:
                if b.id != "all" and b.distance > 0:
                    bras.append(b.id+"."+b.distance)
                else:
                    bras.append(b.id)
            bra_id = "_".join(bras)
        else:
            bra_id = "<bra>"
        
        url = '{0}/{1}/{2}/{3}/{4}/{5}/'.format(self.app.type, 
                self.dataset, bra_id, self.filter1, self.filter2, self.output)
        return url

    '''Returns the data URL for the specific build. This URL will return the 
    data required for building a viz of this app.
    '''
    def data_url(self, **kwargs):
        
        bras = []
        if isinstance(self.bra,(list,tuple)):
            for b in self.bra:
                if b.id != "all" and b.distance > 0:
                    bras.append(b.id+"."+b.distance)
                else:
                    bras.append(b.id)
            bra = "_".join(bras)
        else:
            bra = "<bra>"
        
        if self.output == "bra":
            if bra == "all" and self.app.type == "geo_map":
                bra = "show.2"
            elif bra == "all":
                bra = "show.8"
            else:
                bra = bra + ".show.8"
            
        filter1 = self.filter1
        if filter1 == "all" or self.app.type == "rings":
            if self.output == "isic":
                filter1 = "show.5"
            elif self.output == "hs":
                filter1 = "show.6"
        
        filter2 = self.filter2
        if filter2 == "all" or self.app.type == "rings":
            if self.output == "cbo":
                filter2 = "show.4"
            elif self.output == "wld":
                filter2 = "show.5"

        data_url = '{0}/all/{1}/{2}/{3}/'.format(self.dataset, bra, 
            filter1, filter2)
        return data_url
    
    '''Returns the data table required for this build'''
    def data_table(self):
        from dataviva.rais.models import Ybi, Ybo, Yio, Yb_rais, Yi, Yo
        from dataviva.secex.models import Ybp, Ybw, Ypw, Yb_secex, Yp, Yw
        
        # raise Exception(self.output)
        if self.dataset == "rais":
            # raise Exception(self.bra[0], self.filter1, self.filter2, self.output)
            if self.bra[0].id == "all" and self.output != "bra":
                return Yio
            elif self.output == "isic" or (self.output == "bra" and self.filter2 == "all"):
                return Ybi
            elif self.output == "cbo" or (self.output == "bra" and self.filter1 == "all"):
                return Ybo
        elif self.dataset == "secex":
            if self.bra[0].id == "all" and self.output != "bra":
                return Ypw
            elif self.output == "hs" or (self.output == "bra" and self.filter2 == "all"):
                return Ybp
            elif self.output == "wld" or (self.output == "bra" and self.filter1 == "all"):
                return Ybw
            
            
            
            if self.filter1 == "all":
                return Ybw
            elif self.filter1 == "all":
                return Ybp
    
    '''Returns the english language title of this build.'''
    def title(self, **kwargs):
        
        lang = g.locale
        if "lang" in kwargs:
            lang = kwargs["lang"]
        
        title_lang = "title_en" if lang == "en" else "title_pt"
        name_lang = "name_en" if lang == "en" else "name_pt"
        
        title = getattr(self, title_lang)
        
        depths = {"en":{"plural":{},"single":{}},"pt":{"plural":{},"single":{}}}
        depths["en"]["single"] = {"2":u"State","4":u"Mesoregion","8":u"Municipality"}
        depths["en"]["plural"] = {"2":u"States","4":u"Mesoregions","8":u"Municipalities"}
        depths["pt"]["single"] = {"2":u"Estado","4":u"Mesorregião","8":u"Município"}
        depths["pt"]["plural"] = {"2":u"Estados","4":u"Mesorregiões","8":u"Municípios"}
        
        if "depth" in kwargs and u"bra_" in kwargs["depth"][0] and kwargs["depth"][0] != "bra_8":
            if depths[lang]["plural"]["8"] in title:
                title = title.replace(depths[lang]["plural"]["8"],depths[lang]["plural"][kwargs["depth"][0][4:]])
            if depths[lang]["single"]["8"] in title:
                title = title.replace(depths[lang]["single"]["8"],depths[lang]["single"][kwargs["depth"][0][4:]])
                
        if self.output == "bra" and isinstance(self.bra,(list,tuple)) and self.bra[0].id == "all":
             title = title.replace(depths[lang]["plural"]["8"],depths[lang]["plural"]["2"])
             title = title.replace(depths[lang]["single"]["8"],depths[lang]["single"]["2"])
         
        if self.app_id != 2:
            if "year" in kwargs:
                year = kwargs["year"]
            else:
                year = __latest_year__[self.dataset]
            title += " ({0})".format(year)
        
        def get_article(attr, article):
            if attr.article_pt:
                if attr.gender_pt == "m":
                    if article == "em": new_article = "no"
                    if article == "de": new_article = "do" 
                    if article == "para": new_article = "para o" 
                elif attr.gender_pt == "f":
                    if article == "em": new_article = "na" 
                    if article == "de": new_article = "da"
                    if article == "para": new_article = "para a" 
                if attr.plural_pt:
                    new_article = new_article + "s"
                return new_article
            else:
                return article
        
        if title:
            if lang == "pt":
                joiner = " e "
            else:
                joiner = " and "
            if "<bra>" in title and isinstance(self.bra,(list,tuple)):
                bras = []
                for b in self.bra:
                    name = title_case(getattr(b, name_lang))
                    if b.id != "all" and b.distance > 0:
                        name = name + " "+b.distance+"km"
                    bras.append(name)
                article_search = re.search('<bra_(\w+)>', title)
                if article_search:
                    title = title.replace(" <bra>", "")
                    title = title.replace(article_search.group(0), joiner.join([get_article(b, article_search.group(1)) + " " + bras[i] for i, b in enumerate(self.bra)]))
                else:
                    title = title.replace("<bra>", joiner.join(bras))
            if "<isic>" in title and hasattr(self,"isic"):
                title = title.replace("<isic>", joiner.join([title_case(getattr(i, name_lang)) for i in self.isic]))
                article_search = re.search('<isic_(\w+)>', title)
                if article_search:
                    title = title.replace(article_search.group(0), joiner.join([get_article(b, article_search.group(1)) for b in self.isic]))
            if "<hs>" in title and hasattr(self,"hs"):
                title = title.replace("<hs>", joiner.join([title_case(getattr(h, name_lang)) for h in self.hs]))
                article_search = re.search('<hs_(\w+)>', title)
                if article_search:
                    title = title.replace(article_search.group(0), joiner.join([get_article(b, article_search.group(1)) for b in self.hs]))
            if "<cbo>" in title and hasattr(self,"cbo"):
                title = title.replace("<cbo>", joiner.join([title_case(getattr(c, name_lang)) for c in self.cbo]))
                article_search = re.search('<cbo_(\w+)>', title)
                if article_search:
                    title = title.replace(article_search.group(0), joiner.join([get_article(b, article_search.group(1)) for b in self.cbo]))
            if "<wld>" in title and hasattr(self,"wld"):
                title = title.replace("<wld>", joiner.join([title_case(getattr(w, name_lang)) for w in self.wld]))
                article_search = re.search('<wld_(\w+)>', title)
                if article_search:
                    title = title.replace(article_search.group(0), joiner.join([get_article(b, article_search.group(1)) for b in self.wld]))

        return title
            

    def serialize(self, **kwargs):
        
        auto_serialized = super(Build, self).serialize()
        
        if isinstance(self.bra,(list,tuple)):
            auto_serialized["bra"] = [b.serialize() for b in self.bra]
            for i,b in enumerate(auto_serialized["bra"]):
                if b["id"] != "all" and self.bra[i].distance:
                    b["distance"] = self.bra[i].distance
                    b["neighbor_ids"] = self.bra[i].neighbor_ids
                elif b["id"] != "all" and len(self.bra[i].pr_ids):
                    b["pr_ids"] = self.bra[i].pr_ids
        
        if hasattr(self, "isic"):
            auto_serialized["isic"] = [i.serialize() for i in self.isic]
        if hasattr(self, "hs"):
            auto_serialized["hs"] = [h.serialize() for h in self.hs]
        if hasattr(self, "cbo"):
            auto_serialized["cbo"] = [c.serialize() for c in self.cbo]
        if hasattr(self, "wld"):
            auto_serialized["wld"] = [w.serialize() for w in self.wld]
        del auto_serialized["title_en"]
        del auto_serialized["title_pt"]
        auto_serialized["title"] = self.title()
        #auto_serialized["id_item"] = self.title()
        auto_serialized["data_url"] = self.data_url()
        auto_serialized["url"] = self.url()
        auto_serialized["ui"] = [ui.serialize() for ui in self.ui.all()]
        auto_serialized["app"] = self.app.serialize()
        
        return auto_serialized

    def __repr__(self):
        return '<Build %s:%r: %s/%s/%s>' % (self.id, self.app.type, self.filter1, self.filter2, self.output)

class UI(db.Model, AutoSerialize):

    __tablename__ = 'apps_ui'

    id = db.Column(db.Integer, db.ForeignKey(Build.id), primary_key = True)
    type = db.Column(db.String(20))
    values = db.Column(db.String(255))
    
    def serialize(self, **kwargs):
        auto_serialized = super(UI, self).serialize()
        auto_serialized["values"] = ast.literal_eval(self.values)
        return auto_serialized
    
    def __repr__(self):
        return '<Build %r: %r>' % (self.type, self.values)