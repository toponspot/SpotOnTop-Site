(function () {
    // Skip the animation only for visitors who prefer reduced motion.
    try {
        if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    } catch (e) { }

    var s = document.createElement('div');
    s.id = 'sot-splash';
    s.setAttribute('role', 'status');
    s.setAttribute('aria-label', 'Loading');
    s.innerHTML =
        '<div class="sot-logo"><i></i><i></i><i></i><span class="sot-dot"></span></div>' +
        '<div class="sot-name">Spot<em>On</em>Top</div>' +
        '<div class="sot-status" id="sot-status">LOADING LIVE TRAFFIC…</div>' +
        '<div class="sot-bar"><b></b></div>' +
        '<div class="sot-tag">Be seen on top.</div>';
    document.body.prepend(s);

    // MIN = minimum time (ms) the splash stays up so the logo can finish drawing.
    var t0 = performance.now(), MIN = 1100;
    var finished = false;

    // Wait for two painted frames so the page behind is settled before we fade.
    function afterPaint(fn) {
        requestAnimationFrame(function () { requestAnimationFrame(fn); });
    }

    function finish() {
        if (finished) return;
        finished = true;
        var wait = Math.max(0, MIN - (performance.now() - t0));
        setTimeout(function () {
            var status = document.getElementById('sot-status');
            if (status) status.innerHTML = '<span class="rd"></span>LIVE';
            s.classList.add('ready');
            setTimeout(function () {
                afterPaint(function () {
                    s.classList.add('done');
                    s.addEventListener('transitionend', function (e) {
                        if (e.target === s) s.remove();
                    });
                    setTimeout(function () { s.remove(); }, 800); // fallback
                });
            }, 500);
        }, wait);
    }

    if (document.readyState === 'complete') afterPaint(finish);
    else addEventListener('load', function () { afterPaint(finish); });

    // Safety: never block the site for more than 6 seconds.
    setTimeout(finish, 6000);
})();