let thresh = 0.9999;
let articles = [];

const feeds = [
    "http://feeds.bbci.co.uk/news/education/rss.xml",
    "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "https://www.goodnewsnetwork.org/category/news/feed/",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
    "http://rss.cnn.com/rss/cnn_world.rss",
    "http://rss.cnn.com/rss/cnn_us.rss",
    "http://rss.cnn.com/rss/cnn_tech.rss",
    "http://rss.cnn.com/rss/cnn_showbiz.rss",
    "https://www.cnbc.com/id/100727362/device/rss/rss.html",
    "https://www.cnbc.com/id/15837362/device/rss/rss.html",
    "https://www.sciencedaily.com/rss/all.xml",
    "http://feeds.washingtonpost.com/rss/national",
    "http://feeds.washingtonpost.com/rss/world"
];

const getArticles = async () => {
    const items = await Promise.all(feeds.map(async (url) => {
        console.log("fetch:", url);
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${url}&api_key=lhynu2bowl69htwabxfem5irmox3hc4pp3u7pig2`);
        const rss = await response.json();
        return rss.items;
    }));

    console.log(items);

    return [].concat(...items);
};

const padSequences = (sequences, metadata) => {
    return sequences.map(seq => {
        if (seq.length > metadata.max_len) {
            seq.splice(0, seq.length - metadata.max_len);
        }
        if (seq.length < metadata.max_len) {
            const pad = [];
            for (let i = 0; i < metadata.max_len - seq.length; ++i) {
                pad.push(0);
            }
            seq = pad.concat(seq);
        }
        return seq;
    });
};

const getMetaData = async () => {
    const metadata = await fetch("https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json");
    return metadata.json()
};

const loadModel = async () => {
    const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
    return await tf.loadLayersModel(url);
};

const predict = (text, model, metadata) => {
    const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    const sequence = trimmed.map(word => {
        const wordIndex = metadata.word_index[word];
        if (typeof wordIndex === 'undefined') {
            return 2; //oov_index
        }
        return wordIndex + metadata.index_from;
    });
    const paddedSequence = padSequences([sequence], metadata);
    const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

    const predictOut = model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    return score;
};

const getDomain = (url) => {
    return url.split("/")[2];
};

const run = async (items) => {
    $("#messages").html(`<s>censoring</s> hand-picking with love...`);

    const model = await loadModel();
    console.log("loaded model...");
    const metadata = await getMetaData();
    console.log("loaded metadata...");
    console.log("evaluating headlines...");

    items.forEach(function (item) {
        const pred = predict(item.title, model, metadata);
        item.sentiment = pred;
        item.domain = getDomain(item.link);
    });
    articles = items;
};

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const display = () => {
    const items = shuffle(articles.filter((item) => item.sentiment > thresh));

    $("#feed").html("");
    $("#messages").show();
    $("#messages").text("rendering...");

    items.forEach((item) => {
        $("#feed").append(`<div class="article section">
                <div class="article-title">
                    <p>&#x2728; <a href="${item.link}" target="_blank">${item.title}</a> &#x2728; (${item.domain})</p>
                    <p class="article-score">niceness: ${item.sentiment}</p>
                </div>` +
            (item.thumbnail ? `<div class="article-image"><img src="${item.thumbnail}"/></div>` : '') +
            `</div>`);
    });

    $("#messages").hide();
    $("#messages").text("");
};

const platitudes = [
    "everything is going to be alright",
    "we'll get through this",
    "you're doing okay :)",
    "hush...hush...",
    "it'll be over soon...",
    "it's okay !",
    "don't worry! be happy!",
    "smile!",
    "you're doing great !",
    "#stayhome",
    "no need to go outside :)",
    "stay safe !",
    "you are loved <3",
    "put things in perspective :)",
    "this too shall pass",
    "staying home saves lives",
    "watching tv all day isn't so bad",
    "your friends are online too"
];

const images = [
    'rainbow.png',
    'thumbs.png',
    'sun.png'
];

const showPlatitude = () => {
    const plat = $(`
        <div class="platitude">
            <img src="${images[Math.floor(Math.random() * images.length)]}"/>
            <p>${platitudes[Math.floor(Math.random() * platitudes.length)]}</p>
        </div>
    `);

    plat.find("p").css({color: `rgb(${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0}`});

    $("#platitudes").append(plat);
    plat.offset({
        top: ($(window).height() - plat.height()) * Math.random(),
        left: ($(window).width() - plat.width()) * Math.random()
    });
    plat.fadeIn(1000);
    setTimeout(() => {
        plat.fadeOut(3000, () => plat.remove());
    }, 2000);
};

const firePlatitude = () => {
    showPlatitude();
    setTimeout(firePlatitude, 3000 + 10000 * Math.random());
};

// Main
$(document).ready(() => {
    $("#toggle-about").click((e) => {
        if ($("#about-text").is(":visible")) {
            $("#about-text").hide();
        } else {
            $("#about-text").show();
        }
    });

    // Setup threshold slider
    const handleThreshSelect = (e) => {
        const value = e.target.value;
        thresh = 1 - 1 / (value / 50 + 1);
        setThreshValue();
        display();
    };
    $("#thresh-select").on('change', handleThreshSelect);


    const handleThreshValue = (e) => {
        const value = e.target.value;
        if (value < 0 || value > 1) {
            setThreshValue();
            return;
        }
        thresh = value;

        setThreshSlider();
        display();
    };
    $("#thresh-value").on('change', handleThreshValue);

    const setThreshSlider = () => {
        const slideval = parseInt((1 / (1 - thresh) - 1) * 50);
        $("#thresh-select").val(slideval);
    };

    const setThreshValue = () => $("#thresh-value").val(thresh);

    setThreshValue();
    setThreshSlider();

    $("#messages").text("fetching the news...");
    getArticles().then(function (result) {
        run(result).then(display);
    });

    setTimeout(firePlatitude, 5000);
});
