######################################################################
# pro file for complexity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = iaintersect

CONFIG   += console warn_on release
CONFIG   -= app_bundle

QT       -= gui
QT       += sql



DEFINES      += _WARDROBE_  \
                 D_USE_BAM  \
                _NORMAL

!win32{

DEFINES                  += _APPNAME=\\\"$$TARGET\\\"
LIBS                     += -lm -lz ../../thirdparty/bamtools/libbamtools.a
#QMAKE_CXXFLAGS          += -Werror 
#-std=c++0x

lib_bamtools.commands    = cd ../../thirdparty/bamtools/; qmake; $(MAKE) -j 8
QMAKE_EXTRA_TARGETS      = lib_bamtools
PRE_TARGETDEPS           = lib_bamtools

OBJECTS_DIR              = GeneratedFiles
UI_DIR                   = GeneratedFiles
MOC_DIR                  = GeneratedFiles
RCC_DIR                  = GeneratedFiles

INCLUDEPATH += /usr/local/include/
}

macx{

QMAKE_CFLAGS_X86_64 += -mmacosx-version-min=10.7
QMAKE_CXXFLAGS_X86_64 = $$QMAKE_CFLAGS_X86_64

}

win32{

DEFINES        += _APPNAME=\"$$TARGET\"
LIBS           += -lbamtools

}

DEPENDPATH  +=  . \
                ./src \
                ../global \
                ../../thirdparty/bamtools 

INCLUDEPATH +=  . \
                ./src \
                ../global \
                ../../thirdparty/bamtools



HEADERS     +=  src/iaintersect.hpp \
                ../global/Arguments.hpp \
                ../global/Settings.hpp


SOURCES     +=  src/main.cpp \
                src/iaintersect.cpp \
		../global/Arguments.cpp \
		../global/Settings.cpp




QMAKE_CLEAN += $$TARGET logfile.log *~ *.txt ../global/*~

