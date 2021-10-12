FilePond.registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileEncode,
);

FilePond.setOptions({
	imagePreviewHeight: 170,
    imageCropAspectRatio: '1:1',
    stylePanelAspectRatio: 20 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 20,
	styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    styleButtonProcessItemPosition: 'right bottom',
});

FilePond.parse(document.body);