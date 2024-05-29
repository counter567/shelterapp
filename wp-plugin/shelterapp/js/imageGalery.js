jQuery(($) => {

    // Set all variables to be used in scope
    let frame;
    const metaBox = $('#postimagegalery.postbox');
    const imgContainer = $('#postimagegalery.postbox #image-gallery');

    // ADD IMAGE LINK
    metaBox.on('click', '#add_image_to_galery', (event) => {
        event.preventDefault();

        // If the media frame already exists, reopen it.
        if (frame) {
            frame.open();
            return;
        }

        // Create a new media frame
        frame = wp.media({
            title: 'Select or Upload Media Of Your Chosen Persuasion',
            button: {
                text: 'Use this media'
            },
            multiple: true  // Set to true to allow multiple files to be selected
        });


        // When an image is selected in the media frame...
        frame.on('select', function () {

            // Get media attachment details from the frame state
            console.log(frame.state().get('selection'));

            var attachment = frame.state().get('selection').toJSON();
            console.log(attachment);

            attachment.forEach(element => {
                imgContainer.append(`
                    <div class="image-gallery-item" data-id="' . $id . '">
                        <img src="${element.url}" alt="Bild">
                        <input type="button" class="button button-primary button-large delete" value="Löschen">
                        <input type="hidden" name="otherPictureFileUrls[]" value="${element.id}">
                    </div>
                `);
            });
        });

        // Finally, open the modal on click
        frame.open();
    });


    // DELETE IMAGE LINK
    metaBox.on('click', '.delete', function (event) {
        event.preventDefault();
        $(this).parent().remove();
    });

});


/*
(function (a) {
    const featuredImageGalery = {
        get: function () {
            debugger;
            return [];
        },
        set: function (e) {
            debugger;
            var t = wp.media.view.settings;
            t.post.featuredImageId = e,
                wp.media.post("get-post-thumbnail-html", {
                    post_id: t.post.id,
                    thumbnail_id: t.post.featuredImageId,
                    _wpnonce: t.post.nonce
                }).done(function (e) {
                    "0" === e ? window.alert(wp.i18n.__("Could not set that as the thumbnail image. Try a different attachment.")) : a(".inside", "#postimagediv").html(e)
                })
        },
        remove: function () {
            debugger;
            featuredImageGalery.set(-1)
        },
        frame: function () {
            return this._frame ? wp.media.frame = this._frame : (this._frame = wp.media({
                title: 'Select or Upload Media Of Your Chosen Persuasion',
                button: {
                    text: 'Use this media'
                },
                multiple: true  // Set to true to allow multiple files to be selected
            }),
                this._frame.on("select", this.select)),
                this._frame
        },
        select: function () {
            debugger;
            var e = this.state().get("selection");
            console.log(e);
            //wp.media.view.settings.post.featuredImageId && featuredImageGalery.set(e ? e.id : -1)

        },
        init: function () {
            a("#postimagegalery").on("click", "#add_image_to_galery", function (e) {
                e.preventDefault();
                e.stopPropagation();
                featuredImageGalery.frame().open();
            }).on("click", "#remove-post-thumbnail", function () {
                return featuredImageGalery.remove(),
                    !1
            })
        }
    };
    a(featuredImageGalery.init);
})(jQuery);*/