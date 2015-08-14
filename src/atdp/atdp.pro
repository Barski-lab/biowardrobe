######################################################################
# pro file for atdheatmap plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = atdp

CONFIG   += console warn_on release
CONFIG   -= app_bundle

QT       -= gui
QT       += sql


DEFINES     += D_USE_BAM \
               _WARDROBE_


HEADERS     += ../global/SamReader.hpp \
               ../global/Arguments.hpp \
               ../global/Settings.hpp \
               src/atdp.hpp \
    src/atdpbasics.h


SOURCES     += ../global/Reads.cpp \
               ../global/Arguments.cpp \
               ../global/Settings.cpp \
               src/atdp.cpp \
               src/main.cpp \
    src/atdpbasics.cpp

INCLUDEPATH += . \
               ./src \
               ../global \
               ../../thirdparty/bamtools \
               ../averagedensity/src/

DEPENDPATH  += .


!win32{

OBJECTS_DIR = GeneratedFiles
UI_DIR      = GeneratedFiles
MOC_DIR     = GeneratedFiles
RCC_DIR     = GeneratedFiles

DEFINES        += _APPNAME=\\\"$$TARGET\\\"
LIBS           += -lm -lz ../../thirdparty/bamtools/libbamtools.a -lz
#QMAKE_CXXFLAGS += -Werror

lib_bamtools.commands = cd ../../thirdparty/bamtools/; qmake; $(MAKE) -j 8
QMAKE_EXTRA_TARGETS   = lib_bamtools
PRE_TARGETDEPS        = lib_bamtools

INCLUDEPATH += /usr/local/include/

}

macx{

#-std=c++11
QMAKE_CFLAGS_X86_64 += -mmacosx-version-min=10.7
QMAKE_CXXFLAGS_X86_64 = $$QMAKE_CFLAGS_X86_64

}

win32{

DEFINES        += _APPNAME=\"$$TARGET\"
LIBS           += -lbamtools

}

QMAKE_CLEAN += $${TARGET} logfile.log *~ ./src/*~ *.txt ../global/*~

