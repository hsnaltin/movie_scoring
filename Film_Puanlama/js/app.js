const bildirimVer = (mesaj, tip) => {
    const kutu = document.getElementById("bildirim-kutusu");
    if (!kutu) return;
    const b = document.createElement("div");
    b.className = `bildirim ${tip}`;
    b.innerText = mesaj;
    kutu.appendChild(b);
    setTimeout(() => { b.classList.add("goster"); setTimeout(() => { b.classList.remove("goster"); setTimeout(() => b.remove(), 500); }, 3000); }, 100);
};

class FilmServisi {
    constructor() {
        this.suankiSayfa = 1;
        this.toplamSayfa = 1;
        this.apiAnahtari = "99a7a8dc764a2c69abe4e673cb264ce0";
        this.kucukResimYolu = "https://image.tmdb.org/t/p/w342/";
        this.buyukResimYolu = "https://image.tmdb.org/t/p/w1280/";
        this.suankiSayfa = 1;
        this.listeKonteyniri = document.querySelector(".film-listesi");
        this.sayfaGosterge = document.getElementById("sayfa-no");
        this.geriAlani = document.getElementById("geri-buton-alani");
        this.aktifMod = "populer";
        this.aramaTerimi = "";
    }



    urlOlustur(mod, sayfa) {
        if (mod === "enYuksek") return `https://api.themoviedb.org/3/movie/top_rated?api_key=${this.apiAnahtari}&language=tr-TR&page=${sayfa}`;
        if (mod === "arama") return `https://api.themoviedb.org/3/search/movie?api_key=${this.apiAnahtari}&language=tr-TR&query=${this.aramaTerimi}&page=${sayfa}`;
        return `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiAnahtari}&language=tr-TR&sort_by=popularity.desc&page=${sayfa}`;
    }

    anasayfayaDon() {
        if (this.aktifMod === "detay") {
            
            if (this.eskiMod === "profil") {
                this.profilimYukle();
            } else {
                
                this.aktifMod = this.eskiMod || "populer";
                this.filmleriYukle(this.urlOlustur(this.aktifMod, this.suankiSayfa));
            }
        } else {
            
            this.aktifMod = "populer";
            this.suankiSayfa = 1;
            this.aramaTerimi = "";
            this.filmleriYukle(this.urlOlustur("populer", 1));
        }
    }

    async filmleriYukle(url) {

        try {
            const cevap = await fetch(url);
            const veri = await cevap.json();

            this.toplamSayfa = veri.total_pages;
            this.filmleriEkranaBas(veri.results);
            this.sayfaGosterge.innerText = this.suankiSayfa;
            
            const sayfalamaAlani = document.querySelector(".sayfalama-alani");
            if (sayfalamaAlani) {
                sayfalamaAlani.style.display = (this.aktifMod === "profil" || this.aktifMod === "detay") ? "none" : "flex";
            }          
            const oncekiBtn = document.getElementById("onceki-sayfa");
            const sonrakiBtn = document.getElementById("sonraki-sayfa");

            if (oncekiBtn) {                
                oncekiBtn.style.visibility = (this.suankiSayfa === 1) ? "hidden" : "visible";
            }            
            if (sonrakiBtn) {               
                sonrakiBtn.style.visibility = (this.suankiSayfa >= this.toplamSayfa) ? "hidden" : "visible";
            }
           
            this.geriAlani.style.display = (this.aktifMod === "populer" && this.suankiSayfa === 1) ? "none" : "block";

        } catch (hata) {
            bildirimVer("Filmler yüklenirken hata oluştu!", "hata");
        }
    }
    async enYuksekPuanlilariYukle() {
        this.aktifMod = "enYuksek";
        this.suankiSayfa = 1;
        this.filmleriYukle(this.urlOlustur("enYuksek", 1));
    }
    async profilimYukle() {
        this.aktifMod = "profil";
        const eposta = localStorage.getItem("currentUserEmail");
        const puanlar = JSON.parse(localStorage.getItem(`${eposta}_ratings`) || "{}");
        const filmIdleri = Object.keys(puanlar);

        if (filmIdleri.length === 0) {
            bildirimVer("Henüz puanladığınız bir film yok!", "hata");
            this.anasayfayaDon();
            return;
        }
       
        const filmBasinaLimit = 20;
        this.toplamSayfa = Math.ceil(filmIdleri.length / filmBasinaLimit);

        
        const baslangic = (this.suankiSayfa - 1) * filmBasinaLimit;
        const bitis = baslangic + filmBasinaLimit;
        const gosterilecekIdler = filmIdleri.slice(baslangic, bitis);
        
        this.geriAlani.style.display = "block"; 
        const sayfalamaAlani = document.querySelector(".sayfalama-alani");
        sayfalamaAlani.style.display = "flex"; 

        let toplananHTML = `<h2 class='liste-baslik' style='width:100%; text-align:center;'>Puanladığınız Filmler (${this.suankiSayfa}/${this.toplamSayfa})</h2>`;

        for (let id of gosterilecekIdler) {
            try {
                const cevap = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${this.apiAnahtari}&language=tr-TR`);
                const film = await cevap.json();
                toplananHTML += this.filmKartiOlustur(film);
            } catch (hata) {
                console.error("Film yüklenemedi ID:", id);
            }
        }

        this.listeKonteyniri.innerHTML = toplananHTML;
        this.sayfaGosterge.innerText = this.suankiSayfa;
       
        const oncekiBtn = document.getElementById("onceki-sayfa");
        const sonrakiBtn = document.getElementById("sonraki-sayfa");

        oncekiBtn.style.visibility = (this.suankiSayfa === 1) ? "hidden" : "visible";
        sonrakiBtn.style.visibility = (this.suankiSayfa >= this.toplamSayfa) ? "hidden" : "visible";

        window.scrollTo(0, 0);
    }

    filmleriEkranaBas(filmler) {
        let toplananHTML = "";
        filmler.forEach(film => {
            toplananHTML += this.filmKartiOlustur(film);
        });

        this.listeKonteyniri.innerHTML = toplananHTML;
        window.scrollTo(0, 0);
    }

    filmKartiOlustur(film) {
        return `
            <div class="film-kart" onclick="filmAraci.filmDetayYukle(${film.id})">
                <div class="film-ust-kisim">
                    <img class="film-poster" src="${this.kucukResimYolu}${film.poster_path}" alt="${film.title}" loading="lazy">
                </div>
                <div class="film-alt-bilgi">
                    <h4 class="film-adi">${film.title}</h4>
                    <span class="imdb-skor">★ ${film.vote_average.toFixed(1)}</span>
                </div>
            </div>`;
    }

    async filmDetayYukle(id) {
    
    if (this.aktifMod !== "detay") this.eskiMod = this.aktifMod;
    this.aktifMod = "detay";
    
    this.listeKonteyniri.innerHTML = `<div class="yukleniyor">Film detayları hazırlanıyor...</div>`;
    
    try {
        const cevap = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${this.apiAnahtari}&language=tr-TR`);
        const film = await cevap.json();

        const eposta = localStorage.getItem("currentUserEmail");
        const puanlar = JSON.parse(localStorage.getItem(`${eposta}_ratings`) || "{}");

        this.filmDetayEkranaBas(film, puanlar[id]);
    } catch (hata) {
        bildirimVer("Film detayları yüklenirken hata oluştu!", "hata");
    }
}

    filmDetayEkranaBas(film, kayitliPuan) {
        this.geriAlani.style.display = "block";
        document.querySelector(".sayfalama-alani").style.display = "none";
        this.listeKonteyniri.innerHTML = "";

        const eposta = localStorage.getItem("currentUserEmail");
        const tumPuanlar = JSON.parse(localStorage.getItem(`${eposta}_ratings`) || "{}");
        const tumYorumlar = JSON.parse(localStorage.getItem(`${eposta}_comments`) || "{}");

        const varmiPuan = tumPuanlar[film.id] !== undefined;
        const varmiYorum = tumYorumlar[film.id] !== undefined && tumYorumlar[film.id].trim() !== "";
        const kayitliYorum = tumYorumlar[film.id] || "";

        const profilModu = true;

        let yildizlarHTML = "";
        let gercekPuan = parseFloat(kayitliPuan) || 0;
        for (let i = 1; i <= 10; i++) {
            let sinif = "";
            if (gercekPuan >= i) sinif = "tam";
            else if (gercekPuan >= i - 0.5) sinif = "yarim";
            yildizlarHTML += `<span class="yildiz ${sinif}" onclick="yildizTiklandi(event, ${film.id}, ${i}, ${profilModu}, false)">★</span>`;
        }

        let etkilesimArayuzu = `<p class="bilgi-metni" style="color:#ffcc00; font-size:14px;">Puan vermek veya yorum yapmak için giriş yapmalısınız.</p>`;
        if (localStorage.getItem("currentUser")) {
            const puanButonHTML = `<button class="islem-btn puan-kaydet-btn" onclick="puanKaydet(${film.id})">${varmiPuan ? 'Puanı Güncelle' : 'Puanı Kaydet'}</button>`;
            const yorumButonHTML = `<button class="islem-btn yorum-btn" onclick="yorumKaydet(${film.id})">${varmiYorum ? 'Yorumu Güncelle' : 'Yorumu Kaydet'}</button>`;
            const yorumBtnMetin = kayitliYorum ? "Yorumu Gör/Düzenle" : "Yorum Yap";

            etkilesimArayuzu = `
                <div class="etkilesim-alani detay-etkilesim">
                    <h3>Filmi Değerlendir</h3>
                    <div class="yildiz-konteynir" id="yildiz-grup-${film.id}" data-secilen="${gercekPuan}">
                        ${yildizlarHTML}
                    </div>
                    <p class="user-score" id="skor-metin-${film.id}">${gercekPuan ? 'Seçilen Puan: ' + gercekPuan : 'Puan Seçin'}</p>
                    ${puanButonHTML}
                    
                    <button class="yorum-ac-btn" onclick="yorumAlaniniAc(${film.id})">${yorumBtnMetin}</button>
                    
                    <div class="yorum-alani-gizli" id="yorum-alani-${film.id}" style="${kayitliYorum ? 'display:block;' : ''}">
                        <div class="yorum-grubu">
                            <textarea id="yorum-input-${film.id}" placeholder="Film hakkında ne düşünüyorsun?">${kayitliYorum}</textarea>
                            ${yorumButonHTML}
                        </div>
                    </div>
                </div>`;
        }

        const detayHTML = `
            <div class="film-detay-kapsayici">
                <img class="film-detay-poster" src="${this.buyukResimYolu}${film.poster_path}" alt="${film.title}">
                <div class="film-detay-bilgi">
                    <h2 class="detay-baslik">${film.title}</h2>
                    <span class="imdb-skor detay-skor">IMDB: ★ ${film.vote_average.toFixed(1)}</span>
                    <h3 class="detay-alt-baslik">Özet</h3>
                    <p class="film-detay-ozet">${film.overview || "Bu film için özet bulunmuyor."}</p>
                    
                    ${etkilesimArayuzu}
                </div>
            </div>`;

        this.listeKonteyniri.innerHTML = detayHTML;
        window.scrollTo(0, 0);
    }
}


const filmAraci = new FilmServisi();

window.yorumAlaniniAc = function (filmId) {
    const alan = document.getElementById(`yorum-alani-${filmId}`);
    if (!alan) return;
    const suAnkiDurum = window.getComputedStyle(alan).display;
    if (suAnkiDurum === "none") {
        alan.style.display = "block";
        const inputAlan = document.getElementById(`yorum-input-${filmId}`);
        if (inputAlan && !inputAlan.readOnly) inputAlan.focus();
    } else {
        alan.style.display = "none";
    }
};

window.yildizTiklandi = function (e, filmId, index, profilModu, varmiPuan) {
    const hedef = e.currentTarget || e.target;
    const yildizKutusu = hedef.getBoundingClientRect();
    const tiklananX = e.clientX - yildizKutusu.left;

    const bucukluMu = tiklananX < (yildizKutusu.width / 2);
    const puan = bucukluMu ? (index - 0.5) : index;

    const konteynir = document.getElementById(`yildiz-grup-${filmId}`);
    if (!konteynir) return;

    konteynir.setAttribute("data-secilen", puan);

    const yildizlar = konteynir.querySelectorAll(".yildiz");
    yildizlar.forEach((y, i) => {
        const mevcutSira = i + 1;
        y.classList.remove("tam", "yarim", "aktif");

        if (puan >= mevcutSira) {
            y.classList.add("tam");
        } else if (puan >= mevcutSira - 0.5) {
            y.classList.add("yarim");
        }
    });

    const metinAlan = document.getElementById(`skor-metin-${filmId}`);
    if (metinAlan) {
        metinAlan.innerText = `Seçilen Puan: ${puan}`;
    }
};

window.puanKaydet = function (filmId) {
    const eposta = localStorage.getItem("currentUserEmail");
    const yildizKonteynir = document.getElementById(`yildiz-grup-${filmId}`);

    if (!yildizKonteynir) return;

    const secilenPuan = yildizKonteynir.getAttribute("data-secilen");

    if (!secilenPuan || secilenPuan === "0" || secilenPuan.trim() === "") {
        bildirimVer("Lütfen bir puan seçiniz!", "hata");
        return;
    }

    const puanlar = JSON.parse(localStorage.getItem(`${eposta}_ratings`) || "{}");

    puanlar[filmId] = secilenPuan;

    localStorage.setItem(`${eposta}_ratings`, JSON.stringify(puanlar));

    bildirimVer("Puanınız kaydedildi!", "basari");
    filmAraci.anasayfayaDon();
};

window.yorumKaydet = function (filmId) {
    const eposta = localStorage.getItem("currentUserEmail");
    const yorumInput = document.getElementById(`yorum-input-${filmId}`);

    if (!yorumInput) return;
    const yorum = yorumInput.value.trim();

    if (yorum.trim() === "") {

        bildirimVer("Yorum alanı boş bırakılamaz!", "hata");
        return;
    }

    const yorumlar = JSON.parse(localStorage.getItem(`${eposta}_comments`) || "{}");
    yorumlar[filmId] = yorum;
    localStorage.setItem(`${eposta}_comments`, JSON.stringify(yorumlar));


    const alan = document.getElementById(`yorum-alani-${filmId}`);
    if (alan) {
        alan.style.display = "none";
    }
    bildirimVer("Yorumunuz kaydedildi!", "basari");
};

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("currentUser")) {
        document.getElementById("giris-bolumu").style.display = "none";
        document.getElementById("kullanici-bolumu").style.display = "flex";
        document.getElementById("profil-butonu").onclick = () => {
            filmAraci.suankiSayfa = 1; 
            filmAraci.profilimYukle();
        };
    }
    filmAraci.filmleriYukle(filmAraci.urlOlustur("populer", 1));
});

document.querySelector("#arama-formu").onsubmit = (e) => {
    e.preventDefault();
    const terim = document.querySelector("#arama-girdisi").value;
    if (terim) {
        filmAraci.aramaTerimi = terim;
        filmAraci.aktifMod = "arama";
        filmAraci.suankiSayfa = 1;
        filmAraci.filmleriYukle(filmAraci.urlOlustur("arama", 1));
    }
};

document.getElementById("cikis-butonu").onclick = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserEmail");
    location.reload();
};
document.getElementById("sonraki-sayfa").onclick = () => {
    if (filmAraci.suankiSayfa < filmAraci.toplamSayfa) {
        filmAraci.suankiSayfa++;
        if (filmAraci.aktifMod === "profil") {
            filmAraci.profilimYukle();
        } else {
            filmAraci.filmleriYukle(filmAraci.urlOlustur(filmAraci.aktifMod, filmAraci.suankiSayfa));
        }
    }
};

document.getElementById("onceki-sayfa").onclick = () => {
    if (filmAraci.suankiSayfa > 1) {
        filmAraci.suankiSayfa--;
        if (filmAraci.aktifMod === "profil") {
            filmAraci.profilimYukle();
        } else {
            filmAraci.filmleriYukle(filmAraci.urlOlustur(filmAraci.aktifMod, filmAraci.suankiSayfa));
        }
    }
};

