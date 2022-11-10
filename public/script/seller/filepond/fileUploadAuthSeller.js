FilePond.registerPlugin(
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileEncode,
);

FilePond.setOptions({
    stylePanelAspectRatio: 20 / 100,
	styleLoadIndicatorPosition: 'center bottom',
    styleProgressIndicatorPosition: 'right bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    styleButtonProcessItemPosition: 'right bottom',
});

FilePond.parse(document.body);