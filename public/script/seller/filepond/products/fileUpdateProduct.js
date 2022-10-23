const pond = FilePond.create();

pond.addFile('/public/assets/images/mainLogo.png');

FilePond.registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize
);



FilePond.parse(document.body);