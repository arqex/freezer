var gulp = require('gulp'),
	fs = require('fs'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	insert = require('gulp-insert')
;

var packageName = 'freezer';

var pack = require( './package.json' );

var core = function( fileContents ){
	//Transform the buffer to string
	return ( '' + fileContents).split('//#build')[1];
};


var wrap = function( src ) {
	var now = new Date(),
		wrapper = fs.readFileSync('./build/wrapper.txt', {encoding: 'utf8'})
	;

	return wrapper
		.replace( /%%name%%/g, pack.name)
		.replace( /%%version%%/g, pack.version)
		.replace( /%%author%%/g, pack.author)
		.replace( /%%license%%/g, pack.license)
		.replace( /%%homepage%%/g, pack.homepage)
		.replace( /%%packageName%%/g, packageName[0].toUpperCase() + packageName.slice(1) )
		.replace( /%%date%%/g, now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear() )
		.replace( /%%contents%%/g, src );
};


var cr = ('/*\n%%name%% v%%version%%\n%%homepage%%\n%%license%%: https://github.com/arqex/' + packageName + '/raw/master/LICENSE\n*/\n')
	.replace( '%%name%%', pack.name)
	.replace( '%%version%%', pack.version)
	.replace( '%%license%%', pack.license)
	.replace( '%%homepage%%', pack.homepage)
;

gulp.task( 'build', function(){
	var src = core( fs.readFileSync('./src/utils.js') ) +
			core( fs.readFileSync('./src/emitter.js') ) +
			core( fs.readFileSync('./src/mixins.js') ) +
			core( fs.readFileSync('./src/frozen.js') ) +
			core( fs.readFileSync('./src/' + packageName + '.js'))
		build = wrap( src )
	;

	fs.writeFileSync( './build/' + packageName + '.js', build );

	gulp.src('./build/' + packageName + '.js')
		.pipe( uglify() )
		.pipe( rename( packageName + '.min.js' ))
		.pipe( insert.prepend( cr ))
		.pipe( gulp.dest('./build') )
	;
});

gulp.task( 'dev', function(){
	gulp.watch( './src/*', ['build'] );
});

gulp.task( 'default', ['build'] );