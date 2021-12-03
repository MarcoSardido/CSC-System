FilePond.registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize
);

FilePond.setOptions({
    labelIdle: `Drag & Drop your product or <span class="filepond--label-action">Browse</span>`
});

FilePond.parse(document.body);
